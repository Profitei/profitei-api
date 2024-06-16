import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
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
  })
  async handlePaymentReceived(paymentInfo: any) {
    this.logger.log(`Received payment info: ${JSON.stringify(paymentInfo)}`);
    try {
      const paymentDetails = await this.mercadoPagoService.getPayment(
        paymentInfo.data.id,
      );

      const order = await this.orderService.findByPaymentId(paymentDetails.id);
      if (paymentDetails.amount === order.paymentData.transaction_amount) {
        // Update order status
        await this.orderService.updateOrderStatus(order.id);
      } else {
        this.logger.warn(
          `Payment amount for order ${order.id} does not match. Expected ${order.paymentData.transaction_amount}, but got ${paymentDetails.amount}.`,
        );
      }
    } catch (error) {
      this.logger.error('Error processing payment:', error);
    }
  }
}
