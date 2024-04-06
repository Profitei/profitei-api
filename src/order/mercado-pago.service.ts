// mercadopago.service.ts
import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Payment } from 'mercadopago';

@Injectable()
export class MercadoPagoService {
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

      const result = await this.paymentClient.create(paymentData);
      return result;
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }
}
