import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ArmesModule } from './armes/armes.module';

@Module({
  imports: [PrismaModule, ArmesModule],
})
export class AppModule { }
