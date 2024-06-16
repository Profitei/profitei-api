import { Test, TestingModule } from '@nestjs/testing';
import { PaymentConsumerService } from './payment-consumer.service';
import { OrderService } from '../order/order.service';
import { MercadoPagoService } from '../order/mercado-pago.service';
import { Logger } from '@nestjs/common';

describe('PaymentConsumerService', () => {
  let service: PaymentConsumerService;
  let orderService: OrderService;
  let mercadoPagoService: MercadoPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentConsumerService,
        {
          provide: OrderService,
          useValue: {
            findByPaymentId: jest.fn(),
            updateOrderStatus: jest.fn(),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            getPayment: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentConsumerService>(PaymentConsumerService);
    orderService = module.get<OrderService>(OrderService);
    mercadoPagoService = module.get<MercadoPagoService>(MercadoPagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle payment received and update order status if amounts match', async () => {
    const paymentInfo = { data: { id: 'payment-id' } };
    const paymentDetails = { id: 1, amount: 100 };
    const order = {
      id: 1,
      paymentData: { transaction_amount: 100 },
      status: 'pending',
      created: new Date(),
      tickets: [],
    };
    const orderId = order.id;

    jest
      .spyOn(mercadoPagoService, 'getPayment')
      .mockResolvedValue(paymentDetails);
    jest.spyOn(orderService, 'findByPaymentId').mockResolvedValue(order);
    jest.spyOn(orderService, 'updateOrderStatus').mockResolvedValue(orderId);

    await service.handlePaymentReceived(paymentInfo);

    expect(mercadoPagoService.getPayment).toHaveBeenCalledWith('payment-id');
    expect(orderService.findByPaymentId).toHaveBeenCalledWith(
      paymentDetails.id,
    );
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(order.id);
  });

  it('should log a warning if payment amounts do not match', async () => {
    const paymentInfo = { data: { id: 'payment-id' } };
    const paymentDetails = { id: 1, amount: 100 };
    const order = {
      id: 1,
      paymentData: { transaction_amount: 90 },
      status: 'pending',
      created: new Date(),
      tickets: [],
    };
    jest
      .spyOn(mercadoPagoService, 'getPayment')
      .mockResolvedValue(paymentDetails);
    jest.spyOn(orderService, 'findByPaymentId').mockResolvedValue(order);
    const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn');

    await service.handlePaymentReceived(paymentInfo);

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      `Payment amount for order ${order.id} does not match. Expected ${order.paymentData.transaction_amount}, but got ${paymentDetails.amount}.`,
    );
  });

  it('should log an error if there is an exception', async () => {
    const paymentInfo = { data: { id: 'payment-id' } };
    const error = new Error('Test error');

    jest.spyOn(mercadoPagoService, 'getPayment').mockRejectedValue(error);
    const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

    await service.handlePaymentReceived(paymentInfo);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Error processing payment:',
      error,
    );
  });
});
