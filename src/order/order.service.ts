import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoService } from './mercado-pago.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running Cron Job - Cancel Pending Orders');
    await this.cancelPendingOrders();
  }

  async create(createOrderDto: CreateOrderDto, user: User) {
    this.logger.log('Creating a new order');
    const tickets = await this.prisma.ticket.findMany({
      where: {
        id: {
          in: createOrderDto.ticketsId,
        },
        status: 'AVAILABLE',
      },
      include: {
        Raffle: true,
      },
    });

    if (tickets.length !== createOrderDto.ticketsId.length) {
      this.logger.error('Some tickets are not available');
      throw new Error('Some tickets are not available');
    }

    let paymentResult: any;
    const totalPrice = tickets.reduce(
      (acc, ticket) => acc + ticket.Raffle.price,
      0,
    );

    const uniqueNames = Array.from(
      new Set(tickets.map((ticket) => ticket.Raffle.name)),
    );
    const description =
      uniqueNames + ' ' + tickets.map((ticket) => ticket.name).join(', ');

    try {
      paymentResult = await this.mercadoPagoService.createPayment({
        transaction_amount: totalPrice,
        description: description,
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
      await tx.ticket.updateMany({
        where: {
          id: {
            in: createOrderDto.ticketsId,
          },
        },
        data: {
          status: 'UNAVAILABLE',
          userId: user.id,
        },
      });
      const createdOrder = await tx.order.create({
        data: {
          items: {
            connect: createOrderDto.ticketsId.map((id) => ({ id })),
          },
          details: paymentResult,
        },
      });

      return await tx.order.findUnique({
        where: {
          id: createdOrder.id,
        },
        include: {
          items: {
            include: {
              Raffle: true,
            },
          },
        },
      });
    });

    return {
      id: order.id,
      status: order.status,
      created: order.created,
      tickets: order.items,
      paymentData: order.details,
    };
  }

  async findAll() {
    const response = await this.prisma.order.findMany({
      include: {
        items: {
          include: {
            Raffle: true,
          },
        },
      },
    });

    return response.map((order) => ({
      id: order.id,
      status: order.status,
      created: order.created,
      tickets: order.items,
      paymentData: order.details,
    }));
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: {
          include: {
            Raffle: true,
          },
        },
      },
    });

    return {
      id: order.id,
      status: order.status,
      created: order.created,
      tickets: order.items,
      paymentData: order.details,
    };
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    this.logger.log(`Updating order #${updateOrderDto.ticketsId}`);
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async cancelPendingOrders(): Promise<void> {
    this.logger.log('Cancelling pending orders');
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        items: true,
      },
    });

    for (const order of pendingOrders) {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: 'CANCELED',
          },
        });

        await tx.ticket.updateMany({
          where: {
            id: {
              in: order.items.map((item) => item.id),
            },
          },
          data: {
            status: 'AVAILABLE',
            userId: null,
          },
        });
      });
      this.logger.log(`Order ${order.id} cancelled`);
    }
  }
}
