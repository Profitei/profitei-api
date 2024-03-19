import { Module } from '@nestjs/common';
import { RaffleService } from './raffle.service';
import { RaffleController } from './raffle.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [RaffleController],
  providers: [RaffleService],
  imports: [PrismaModule],
})
export class RaffleModule {}
