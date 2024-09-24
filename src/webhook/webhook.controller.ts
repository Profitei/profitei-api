import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';
import { Public } from '../decorators/public.decorator';
import { MercadoPagoGuard } from '../guards/security/mercado-pago.guard';

@Controller('webhook')
@Public()
@UseGuards(MercadoPagoGuard)
export class WebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('payment')
  async handlePaymentNotification(@Body() paymentInfo: any) {
    await this.paymentService.publishPaymentReceived(paymentInfo);
  }
}
