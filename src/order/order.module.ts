import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MercadoPagoService } from './mercado-pago.service';
import { RabbitMQConfigModule } from '../rabbitmq/rabbitmq.module';
import { OrderConsumerService } from './order-consumer.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, MercadoPagoService, OrderConsumerService],
  imports: [PrismaModule, RabbitMQConfigModule],
})
export class OrderModule {}
