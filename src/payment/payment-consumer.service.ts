import { Injectable, Logger } from '@nestjs/common';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { MercadoPagoService } from '../order/mercado-pago.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class PaymentConsumerService {
  constructor(
    private readonly orderService: OrderService,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}
  private readonly logger = new Logger(PaymentConsumerService.name);
  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'payment.received',
    queue: 'payment_received_queue',
    queueOptions: {
      deadLetterExchange: 'amq.direct',
      deadLetterRoutingKey: 'dlx.payment.received',
    },
  })
  async handlePaymentReceived(paymentInfo: any) {
    this.logger.log(`Received payment info: ${JSON.stringify(paymentInfo)}`);
    try {
      const paymentDetails = await this.mercadoPagoService.getPayment(
        paymentInfo.data.id,
      );

      const order = await this.orderService.findByPaymentId(paymentDetails.id);
      await this.orderService.updateOrderStatus(order.id);
    } catch (error) {
      this.logger.error('Error processing payment:', error);
      return new Nack();
    }
  }
}
