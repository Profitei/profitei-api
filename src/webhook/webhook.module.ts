import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PaymentModule } from '../payment/payment.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PaymentModule, UserModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
