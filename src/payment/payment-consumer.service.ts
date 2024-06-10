import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class PaymentConsumerService {
  private readonly logger = new Logger(PaymentConsumerService.name);
  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'payment.received',
    queue: 'payment_received_queue',
  })
  async handlePaymentReceived(paymentInfo: any) {
    this.logger.log(`Received payment info: ${JSON.stringify(paymentInfo)}`);
  }
}
