import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';
import { NoAuth, Public } from 'src/decorators/public.decorator';

@Controller('webhook')
@Public()
@NoAuth()
export class WebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('payment')
  async handlePaymentNotification(@Body() paymentInfo: any) {
    await this.paymentService.publishPaymentReceived(paymentInfo);
  }
}
