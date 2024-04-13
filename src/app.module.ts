import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RaffleModule } from './raffle/raffle.module';
import { CategoryModule } from './category/category.module';
import { TicketModule } from './ticket/ticket.module';
import { PropertiesModule } from './properties/properties.module';
import { OrderModule } from './order/order.module';

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
})
export class AppModule {}
