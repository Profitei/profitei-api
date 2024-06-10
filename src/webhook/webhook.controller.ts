import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('payment')
  async handlePaymentNotification(@Body() paymentInfo: any) {
    await this.paymentService.publishPaymentReceived(paymentInfo);
  }
}
