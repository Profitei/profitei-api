import { Test, TestingModule } from '@nestjs/testing';
import { OrderConsumerService } from './order-consumer.service';
import { OrderService } from '../order/order.service';
import { Logger } from '@nestjs/common';
import { Nack } from '@golevelup/nestjs-rabbitmq';
import { Order } from '../order/entities/order.entity';

describe('OrderConsumerService', () => {
  let service: OrderConsumerService;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderConsumerService,
        {
          provide: OrderService,
          useValue: {
            findOne: jest.fn(),
            cancelPendingOrder: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    service = module.get<OrderConsumerService>(OrderConsumerService);
    orderService = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log and Nack the message if the order is PAID', async () => {
    const id = 1;
    const order: Order = {
      id,
      status: 'PAID',
      tickets: [],
      paymentData: null,
      created: new Date(),
    };

    jest.spyOn(orderService, 'findOne').mockResolvedValue(order);

    const result = await service.handleOrderUpdate(id);

    expect(orderService.findOne).toHaveBeenCalledWith(id);
    expect(result).toBeInstanceOf(Nack);
    expect((result).requeue).toBe(false);
  });

  it('should cancel pending order if the order is not PAID', async () => {
    const id = 1;
    const order: Order = {
      id,
      status: 'PENDING',
      tickets: [],
      paymentData: null,
      created: new Date(),
    };

    jest.spyOn(orderService, 'findOne').mockResolvedValue(order);
    jest.spyOn(orderService, 'cancelPendingOrder').mockResolvedValue(undefined);

    const result = await service.handleOrderUpdate(id);

    expect(orderService.findOne).toHaveBeenCalledWith(id);
    expect(orderService.cancelPendingOrder).toHaveBeenCalledWith(id);
    expect(result).toBeUndefined();
  });

  it('should log an error if an exception occurs', async () => {
    const id = 1;
    const error = new Error('Some error');
    jest.spyOn(orderService, 'findOne').mockRejectedValue(error);
    const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

    await service.handleOrderUpdate(id);

    expect(orderService.findOne).toHaveBeenCalledWith(id);
    expect(loggerErrorSpy).toHaveBeenCalledWith('Error processing order:', error);
  });
});
