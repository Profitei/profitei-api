import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoService } from './mercado-pago.service';
import { User } from '../user/entities/user.entity';
import { Order } from './entities/order.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
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
      throw new BadRequestException(
        `Failed to create payment ${error.message}`,
      );
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
      throw new ConflictException('Some tickets are not available');
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
      throw new NotFoundException('Order not found');
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
      throw new NotFoundException('Order not found');
    }
    return this.mapOrderToDto(order);
  }

  async findByPaymentId(paymentId: string): Promise<Order> {
    const order = await this.prisma.order.findFirst({
      where: { details: { path: ['id'], equals: paymentId } },
      include: { items: { include: { Raffle: true } } },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.mapOrderToDto(order);
  }

  async findAllByUser(user: User) {
    this.logger.log(`Start finding all orders from userId #${user.id}`);

    const response = await this.prisma.order.findMany({
      where: {
        items: {
          every: {
            userId: user.id,
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

    if (!response) {
      throw new NotFoundException(`orders from userId #${user.id} not found`);
    }

    this.logger.log(`Successfully finded all orders from userId #${user.id}`);
    return response.map(this.mapOrderToDto);
  }

  async findOneByUser(id: number, user: User) {
    this.logger.log(
      `Start finding order with userID: ${user.id} orderID ${id}`,
    );

    const response = await this.prisma.order.findUnique({
      where: {
        id: id,
        items: {
          every: {
            userId: user.id,
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

    if (!response) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    this.logger.log(`Order with ID ${id} found`);
    return this.mapOrderToDto(response);
  }

  update(id: number, updateOrderDto: UpdateOrderDto): string {
    this.logger.log(`Updating order #${updateOrderDto.ticketsId}`);
    return `This action updates a #${id} order`;
  }

  async updateOrderStatus(id: number): Promise<number> {
    this.logger.log(`Updating order #${id} status to paid`);
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.PAID },
    });
    return order.id;
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
}
