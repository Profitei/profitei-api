import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoService } from './mercado-pago.service';
import { User } from 'src/user/entities/user.entity';
import { Order } from './entities/order.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import {
  OrderStatus,
  Order as OrderPrisma,
  Ticket as TicketPrisma,
} from '@prisma/client';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  @Cron(CronExpression.EVERY_WEEKDAY)
  async handleCron() {
    this.logger.debug('Running Cron Job - Cancel Pending Orders');
    await this.cancelPendingOrders();
  }

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    this.logger.log('Creating a new order');

    const tickets: Ticket[] = await this.getAvailableTickets(createOrderDto);

    let paymentResult: any;
    try {
      paymentResult = await this.mercadoPagoService.createPayment({
        transaction_amount: this.calculateTotalPrice(tickets),
        description: this.generateOrderDescription(tickets),
        payment_method_id: 'pix',
        email: user.email,
        identificationType: 'CPF',
        number: user.cpf,
      });
      this.logger.log('Payment created successfully');
    } catch (error) {
      this.logger.error('Failed to create payment', error.stack);
      throw new Error('Payment processing failed');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      await this.updateTicketsStatus(createOrderDto.ticketsId, user.id);
      const createdOrder = await tx.order.create({
        data: {
          items: { connect: createOrderDto.ticketsId.map((id) => ({ id })) },
          details: paymentResult,
        },
      });
      return this.getOrderWithDetails(createdOrder.id);
    });

    return order;
  }

  private async getAvailableTickets(
    createOrderDto: CreateOrderDto,
  ): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        id: { in: createOrderDto.ticketsId },
        status: 'AVAILABLE',
      },
      include: { Raffle: true },
    });

    if (tickets.length !== createOrderDto.ticketsId.length) {
      this.logger.error('Some tickets are not available');
      throw new Error('Some tickets are not available');
    }

    return tickets;
  }

  private calculateTotalPrice(tickets: Ticket[]): number {
    return tickets.reduce((acc, ticket) => acc + ticket.Raffle.price, 0);
  }

  private generateOrderDescription(tickets: Ticket[]): string {
    return tickets.map((ticket) => ticket.Raffle.name).join(', ');
  }

  private async updateTicketsStatus(
    ticketsIds: number[],
    userId: number | null,
  ): Promise<void> {
    await this.prisma.ticket.updateMany({
      where: { id: { in: ticketsIds } },
      data: { status: 'UNAVAILABLE', userId: userId },
    });
  }

  private async getOrderWithDetails(orderId: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { Raffle: true } } },
    });
    if (!order) {
      throw new Error('Order not found');
    }
    return {
      id: order.id,
      status: order.status,
      created: order.created,
      tickets: order.items,
      paymentData: order.details,
    };
  }

  async findAll(): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      include: { items: { include: { Raffle: true } } },
    });
    return orders.map(this.mapOrderToDto);
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { Raffle: true } } },
    });
    if (!order) {
      throw new Error('Order not found');
    }
    return this.mapOrderToDto(order);
  }

  async findAllOrdersByStatusAndUser(
    orderStatus?: OrderStatus,
    userId?: number,
  ) {
    const validateOrderStatus = orderStatus ? OrderStatus.PENDING : undefined;

    if (!userId) {
      this.logger.log(`Start find all ${validateOrderStatus} orders`);
    } else {
      this.logger.log(
        `Start find all ${validateOrderStatus} orders with user. ID: ${userId}`,
      );
    }

    const response = await this.prisma.order.findMany({
      where: {
        status: validateOrderStatus,
        items: {
          some: {
            userId: Number(userId),
          },
        },
      },
      include: {
        items: {
          include: {
            Raffle: true,
          },
        },
      },
    });
    this.logger.log(
      `Successfully started finding all ${validateOrderStatus} orders`,
    );
    return response.map(this.mapOrderToDto);
  }

  update(id: number, updateOrderDto: UpdateOrderDto): string {
    this.logger.log(`Updating order #${updateOrderDto.ticketsId}`);
    return `This action updates a #${id} order`;
  }

  remove(id: number): string {
    return `This action removes a #${id} order`;
  }

  async cancelPendingOrders(): Promise<void> {
    this.logger.log('Cancelling pending orders');
    const pendingOrders = await this.prisma.order.findMany({
      where: { status: 'PENDING' },
      include: { items: true },
    });

    this.logger.log(`Found ${pendingOrders.length} pending orders`);
    for (const order of pendingOrders) {
      await this.cancelOrder({
        id: order.id,
        status: order.status,
        created: order.created,
        tickets: order.items,
        paymentData: order.details,
      });
    }
  }

  private async cancelOrder(order: Order): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELED' },
      });
      await this.updateTicketsStatus(
        order.tickets.map((item) => item.id),
        null,
      );
    });
    this.logger.log(`Order ${order.id} cancelled`);
  }

  private mapOrderToDto(order: OrderPrisma & { items: TicketPrisma[] }): Order {
    return {
      id: order.id,
      status: order.status,
      created: order.created,
      tickets: order.items,
      paymentData: order.details,
    };
  }

  private validaterUserIdIsNumber(userId: number): number {
    if (userId && typeof userId === 'number') {
      return userId;
    }
    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
      throw new Error('Invalid userId');
    }
    return parsedUserId;
  }
}
