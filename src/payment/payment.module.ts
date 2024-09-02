import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentConsumerService } from './payment-consumer.service';
import { MercadoPagoService } from '../order/mercado-pago.service';
import { OrderService } from 'src/order/order.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitMQConfigModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [    
    PrismaModule,
    RabbitMQConfigModule,
  ],
  providers: [
    PaymentService,
    PaymentConsumerService,
    MercadoPagoService,
    OrderService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
