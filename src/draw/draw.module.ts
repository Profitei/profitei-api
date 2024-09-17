import { Module } from '@nestjs/common';
import { DrawService } from './draw.service';
import { DrawController } from './draw.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [DrawController],
  providers: [DrawService],
  imports: [PrismaModule],
})
export class DrawModule {}
