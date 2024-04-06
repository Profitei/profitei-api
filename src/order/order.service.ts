import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoService } from './mercado-pago.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    this.logger.log('Creating a new order');
    const tickets = await this.prisma.ticket.findMany({
      where: {
        id: {
          in: createOrderDto.ticketsId,
        },
        status: 'AVAILABLE',
      },
    });

    if (tickets.length !== createOrderDto.ticketsId.length) {
      this.logger.error('Some tickets are not available');
      throw new Error('Some tickets are not available');
    }

    let paymentResult: any;

    try {
      paymentResult = await this.mercadoPagoService.createPayment({
        transaction_amount: 10,
        description: 'Rifa Teste',
        payment_method_id: 'pix',
        email: 'martinelli.evandro@gmail.com',
        identificationType: 'CPF',
        number: '38870305830',
      });
      this.logger.log('Payment created successfully');
    } catch (error) {
      this.logger.error('Failed to create payment', error.stack);
      throw new Error('Payment processing failed');
    }

    return this.prisma.$transaction(async (tx) => {
      tx.ticket.updateMany({
        where: {
          id: {
            in: createOrderDto.ticketsId,
          },
        },
        data: {
          status: 'UNAVAILABLE',
          userId: 1,
        },
      });
      return tx.order.create({
        data: {
          items: {
            connect: createOrderDto.ticketsId.map((id) => ({ id })),
          },
          details: paymentResult,
        },
      });
    });
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    this.logger.log(`Updating order #${updateOrderDto.ticketsId}`);
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
