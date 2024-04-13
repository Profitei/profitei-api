import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RaffleModule } from './raffle/raffle.module';
import { CategoryModule } from './category/category.module';
import { TicketModule } from './ticket/ticket.module';
import { PropertiesModule } from './properties/properties.module';
import { OrderModule } from './order/order.module';
import { FirebaseAuthGuard } from './guards/security/firebase-auth.guard';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    RaffleModule,
    CategoryModule,
    TicketModule,
    PropertiesModule,
    OrderModule,
    ConfigModule.forRoot(
      {
        isGlobal: true,
        envFilePath: ['.env', '.env.local'],
      },
    ),
  ],
  providers: [FirebaseAuthGuard],
})
export class AppModule {}
