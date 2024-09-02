import { Module } from '@nestjs/common';
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
  exports: [RabbitMQModule],
})
export class RabbitMQConfigModule {}
