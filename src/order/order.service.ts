import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoService } from './mercado-pago.service';
import { User } from '../user/entities/user.entity';
import { Order } from './entities/order.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import {
  OrderStatus,
  Status,
  Order as OrderPrisma,
  Ticket as TicketPrisma,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

type PrismaTransaction = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    this.logger.log('Creating a new order');

    const tickets: Ticket[] = await this.getAvailableTickets(createOrderDto);

    const paymentResult = await this.mercadoPagoService.createPayment({
      transaction_amount: this.calculateTotalPrice(tickets),
      description: this.generateOrderDescription(tickets),
      payment_method_id: 'pix',
      email: user.email,
      identificationType: 'E-MAIL',
      number: user.email,
    });

    const order = await this.prisma.$transaction(
      async (tx: PrismaTransaction) => {
        await this.markTicketsUnavailable(
          tx,
          createOrderDto.ticketsId,
          user.id,
        );
        const createdOrder = await this.createOrder(
          tx,
          createOrderDto,
          paymentResult,
          user.id,
        );
        await this.publishOrderCreated(createdOrder.id);
        return this.getOrderWithDetails(tx, createdOrder.id);
      },
    );

    return order;
  }

  private async createOrder(
    tx: PrismaTransaction,
    createOrderDto: CreateOrderDto,
    paymentResult: any,
    userId: number | null,
  ) {
    const createdOrder = await tx.order.create({
      data: {
        items: { connect: createOrderDto.ticketsId.map((id) => ({ id })) },
        details: paymentResult,
        userId: userId,
      },
    });
    this.logger.log(`Order ${createdOrder.id} created`);
    return createdOrder;
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
    return tickets
      .map((ticket) => `${ticket.Raffle.name} - ${ticket.name}`)
      .join(', ');
  }

  private async updateTicketsStatus(
    tx: PrismaTransaction,
    ticketsIds: number[],
    userId: number | null,
    status: Status,
  ): Promise<void> {
    await tx.ticket.updateMany({
      where: { id: { in: ticketsIds } },
      data: { status: status, userId: userId },
    });
    this.logger.log(`Tickets ${ticketsIds} updated to ${status}`);
  }

  private async markTicketsUnavailable(
    tx: PrismaTransaction,
    ticketsIds: number[],
    userId: number | null,
  ): Promise<void> {
    await this.updateTicketsStatus(tx, ticketsIds, userId, Status.UNAVAILABLE);
  }

  private async markTicketsAvailable(
    tx: PrismaTransaction,
    ticketsIds: number[],
  ): Promise<void> {
    await this.updateTicketsStatus(tx, ticketsIds, null, Status.AVAILABLE);
  }

  private async getOrderWithDetails(
    tx: PrismaTransaction,
    orderId: number,
  ): Promise<Order> {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: { include: { Raffle: true } } },
    });
    return {
      id: order.id,
      status: order.status,
      created: order.created,
      tickets: order.items,
      paymentData: order.details,
    };
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
        userId: user.id,
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
        userId: user.id,
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
    await this.checkAndUpdateRaffleStatus(order.id);
    return order.id;
  }

  private async checkAndUpdateRaffleStatus(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { Raffle: true } } },
    });

    const raffleId = order.items[0]?.raffleId;

    if (raffleId) {
      const unpaidTickets = await this.prisma.ticket.findMany({
        where: {
          raffleId,
          OR: [
            { Order: null },
            { Order: { status: { not: OrderStatus.PAID } } },
          ],
        },
      });

      const allTicketsPaid = unpaidTickets.length === 0;

      if (allTicketsPaid) {
        await this.prisma.raffle.update({
          where: { id: raffleId },
          data: { status: Status.AWAITING_DRAW },
        });
      }
    }
  }

  remove(id: number): string {
    return `This action removes a #${id} order`;
  }

  async cancelPendingOrder(id: number): Promise<void> {
    this.logger.log('Cancelling pending order');
    const pendingOrder = await this.prisma.order.findUnique({
      where: { id: id },
      include: { items: true },
    });

    this.logger.log(`Found ${pendingOrder.id} pending order`);
      await this.cancelOrder({
        id: pendingOrder.id,
        status: pendingOrder.status,
        created: pendingOrder.created,
        tickets: pendingOrder.items,
        paymentData: pendingOrder.details,
      });
  }

  private async cancelOrder(order: Order): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELED },
      });
      await this.markTicketsAvailable(
        tx,
        order.tickets.map((item) => item.id),
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

  private async publishOrderCreated(id: number) {
    this.amqpConnection.publish('amq.direct', 'order.created', id);
  }
}
