import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [PropertiesController],
  providers: [PropertiesService],
  imports: [PrismaModule],
})
export class PropertiesModule {}
