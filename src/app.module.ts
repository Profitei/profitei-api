import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RaffleModule } from './raffle/raffle.module';
import { CategoryModule } from './category/category.module';
import { TicketModule } from './ticket/ticket.module';
import { PropertiesModule } from './properties/properties.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    RaffleModule,
    CategoryModule,
    TicketModule,
    PropertiesModule,
  ],
})
export class AppModule {}
