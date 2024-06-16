import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { PaymentService } from '../payment/payment.service';
import { MercadoPagoGuard } from '../guards/security/mercado-pago.guard';

describe('WebhookController', () => {
  let controller: WebhookController;
  let paymentService: PaymentService;

  beforeEach(async () => {
    const mockPaymentService = {
      publishPaymentReceived: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    })
      .overrideGuard(MercadoPagoGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<WebhookController>(WebhookController);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handlePaymentNotification', () => {
    it('should call publishPaymentReceived with paymentInfo', async () => {
      const paymentInfo = { id: 'test' };
      await controller.handlePaymentNotification(paymentInfo);
      expect(paymentService.publishPaymentReceived).toHaveBeenCalledWith(
        paymentInfo,
      );
    });

    it('should handle empty paymentInfo', async () => {
      const paymentInfo = {};
      await controller.handlePaymentNotification(paymentInfo);
      expect(paymentService.publishPaymentReceived).toHaveBeenCalledWith(
        paymentInfo,
      );
    });

    it('should handle null paymentInfo', async () => {
      const paymentInfo = null;
      await controller.handlePaymentNotification(paymentInfo);
      expect(paymentService.publishPaymentReceived).toHaveBeenCalledWith(
        paymentInfo,
      );
    });
  });
});
