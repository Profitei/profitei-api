import { Module } from '@nestjs/common';
import { ArmesService } from './armes.service';
import { ArmesController } from './armes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArmesController],
  providers: [ArmesService],
})
export class ArmesModule { }
