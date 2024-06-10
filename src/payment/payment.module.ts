import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentConsumerService } from './payment-consumer.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

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
  ],
  providers: [PaymentService, PaymentConsumerService],
  exports: [PaymentService],
})
export class PaymentModule {}
