import { Module } from '@nestjs/common';
import { NotifcationsService } from './notifcations.service';
import { NotifcationsController } from './notifcations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports:  [FirebaseModule, PrismaModule],
  controllers: [NotifcationsController],
  providers: [NotifcationsService],
})
export class NotifcationsModule {}
