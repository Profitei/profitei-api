import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';
import { NoAuth, Public } from 'src/decorators/public.decorator';
import { MercadoPagoGuard } from 'src/guards/security/mercado-pago.guard';

@Controller('webhook')
@Public()
@NoAuth()
@UseGuards(MercadoPagoGuard)
export class WebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('payment')
  async handlePaymentNotification(@Body() paymentInfo: any) {
    await this.paymentService.publishPaymentReceived(paymentInfo);
  }
}
