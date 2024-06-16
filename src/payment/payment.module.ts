import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentConsumerService } from './payment-consumer.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MercadoPagoService } from '../order/mercado-pago.service';

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
    MercadoPagoService,
  ],
  providers: [PaymentService, PaymentConsumerService],
  exports: [PaymentService],
})
export class PaymentModule {}
