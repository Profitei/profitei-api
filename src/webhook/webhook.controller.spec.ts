import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { PaymentService } from '../payment/payment.service';
import { MercadoPagoGuard } from '../guards/security/mercado-pago.guard';
import { UserService } from '../user/user.service';

describe('WebhookController', () => {
  let controller: WebhookController;
  let paymentService: PaymentService;
  let userService: UserService;

  beforeEach(async () => {
    const mockPaymentService = {
      publishPaymentReceived: jest.fn(),
    };

    const mockUserService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
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
    userService = module.get<UserService>(UserService);
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

    it('should call userService.create with correct user data', async () => {
      const userInfo = {
        data: {
          first_name: 'John',
          last_name: 'Doe',
          email_addresses: [
            {
              email_address: 'john.doe@example.com',
            },
          ],
        },
      };

      await controller.handleUserNotification(userInfo);

      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john.doe@example.com',
        }),
      );
    });
  });
});
