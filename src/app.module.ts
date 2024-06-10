import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RaffleModule } from './raffle/raffle.module';
import { CategoryModule } from './category/category.module';
import { TicketModule } from './ticket/ticket.module';
import { PropertiesModule } from './properties/properties.module';
import { OrderModule } from './order/order.module';
import { FirebaseAuthGuard } from './guards/security/firebase-auth.guard';
import { SecurityGuard } from './guards/security/security.guard';
import { FirebaseModule } from './firebase/firebase.module';
import { HealthModule } from './health/health.module';
import { WebhookModule } from './webhook/webhook.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    RaffleModule,
    CategoryModule,
    TicketModule,
    PropertiesModule,
    OrderModule,
    FirebaseModule,
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    ScheduleModule.forRoot(),
    WebhookModule,
    PaymentModule,
  ],
  providers: [FirebaseAuthGuard, SecurityGuard],
})
export class AppModule {}
