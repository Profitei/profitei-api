// mercadopago.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MercadoPagoConfig, Payment } from 'mercadopago';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private paymentClient: Payment;

  constructor() {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
    this.paymentClient = new Payment(client);
  }

  async createPayment(req: any): Promise<any> {
    try {
      const paymentData = {
        body: {
          transaction_amount: req.transaction_amount,
          description: req.description,
          payment_method_id: req.payment_method_id,
          payer: {
            email: req.email,
            identification: {
              type: req.identificationType,
              number: req.number,
            },
          },
        },
        requestOptions: { idempotencyKey: '<SOME_UNIQUE_VALUE>' },
      };

      this.logger.log('Creating payment');
      const result = await this.paymentClient.create(paymentData);
      this.logger.log('Payment created successfully');

      return result;
    } catch (error) {
      this.logger.error('Failed to create payment', error.stack);
      throw new Error('Payment creation failed');
    }
  }
}
