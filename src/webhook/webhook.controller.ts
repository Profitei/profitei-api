import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';
import { Public } from '../decorators/public.decorator';
import { MercadoPagoGuard } from '../guards/security/mercado-pago.guard';
import { UserService } from '../user/user.service';

@Controller('webhook')
@Public()

export class WebhookController {
  constructor(
    private readonly paymentService: PaymentService, 
    private readonly userService:UserService 
  ) {}

  @UseGuards(MercadoPagoGuard)
  @Post('payment')
  async handlePaymentNotification(@Body() paymentInfo: any) {
    await this.paymentService.publishPaymentReceived(paymentInfo);
  }

  @Post('user')
  async handleUserNotification(@Body() userInfo: any) {
    await this.userService.create({
      name: userInfo.data.first_name + ' ' + userInfo.data.last_name,
      email: userInfo.data.email_addresses[0].email_address,
      created: new Date(),
    }) 
  }
}
