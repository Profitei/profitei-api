// mercadopago.service.ts
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { PaymentCreateData } from 'mercadopago/dist/clients/payment/create/types';

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
      const paymentData: PaymentCreateData = {
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
      };

      this.logger.log('Creating payment');
      const result = await this.paymentClient.create(paymentData);
      this.logger.log('Payment created successfully');

      return result;
    } catch (error) {
      throw new BadRequestException(`Payment creation failed ${error.message}`);
    }
  }

  async getPayment(paymentId: string): Promise<any> {
    try {
      this.logger.log('Getting payment');
      const result = await this.paymentClient.get({ id: paymentId });
      this.logger.log('Payment retrieved successfully');

      return result;
    } catch (error) {
      throw new NotFoundException(`Payment retrieval failed ${error.message}`);
    }
  }
}
