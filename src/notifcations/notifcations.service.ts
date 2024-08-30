import { Injectable } from '@nestjs/common';
import { CreateNotifcationDto } from './dto/create-notifcation.dto';
import { User } from '../user/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class NotifcationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  async create(user: User, createNotifcationDto: CreateNotifcationDto) {
    const deviceTokens = await this.prisma.deviceToken.findMany({
      where: { userId: user.id },
    });
  
    await Promise.all(
      deviceTokens.map(async (element) => {
        await this.firebase.sendNotification(
          element.token,
          createNotifcationDto.title,
          createNotifcationDto.message,
        );
      })
    );
  
    return await this.prisma.notification.create({
      data: {
        title: createNotifcationDto.title,
        message: createNotifcationDto.message,
        userId: user.id,
      },
    });
  }

  findAll(user: User) {
    return this.prisma.notification.findMany({ where: { userId: user.id } });
  }

  findOne(user: User, id: number) {
    return this.prisma.notification.findUnique({
      where: { id: id, userId: user.id },
    });
  }

  remove(user: User, id: number) {
    return this.prisma.notification.delete({
      where: { id: id, userId: user.id },
    });
  }
}
