import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishPaymentReceived(paymentInfo: any) {
    this.amqpConnection.publish('amq.direct', 'payment.received', paymentInfo);
  }
}
