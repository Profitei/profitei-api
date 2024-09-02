import { Injectable, Logger } from '@nestjs/common';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { OrderService } from '../order/order.service';

@Injectable()
export class OrderConsumerService {
  constructor(
    private readonly orderService: OrderService,
  ) {}
  private readonly logger = new Logger(OrderConsumerService.name);
  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'order.update',
    queue: 'order_update_queue',
  })
  async handleOrderUpdate(id: number) {
    this.logger.log(`Received order: ${id}`);
    try {
      const order = await this.orderService.findOne(id);

      if (order.status == 'PAID') {
        return new Nack(false);
      }

      await this.orderService.cancelPendingOrder(id);
    } catch (error) {
      this.logger.error('Error processing order:', error);
    }
  }
}
