import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentConsumerService } from './payment-consumer.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MercadoPagoService } from '../order/mercado-pago.service';
import { OrderService } from 'src/order/order.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'amq.direct',
          type: 'direct',
        },
      ],
      uri: process.env.RABBITMQ_URI,
      connectionInitOptions: { wait: false },
    }),
    PrismaModule,
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
