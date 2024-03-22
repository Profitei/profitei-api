import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RaffleModule } from './raffle/raffle.module';

@Module({
  imports: [PrismaModule, UserModule, RaffleModule],
})
export class AppModule {}
