import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaOrmHealthIndicator } from './prismaorm.health';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [PrismaOrmHealthIndicator, PrismaService],
})
export class HealthModule {}
