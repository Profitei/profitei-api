import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({ data: createUserDto });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  findByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email } });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  device(user: User, deviceToken: string) {
    return this.prisma.deviceToken.upsert({
      where: { token: deviceToken },
      update: {},
      create: {
        token: deviceToken,
        user: { connect: { id: user.id } },
      },
    });
  }

  findDevices() {
    return this.prisma.deviceToken.findMany();
  }

  google(user: User, createUserDto: CreateUserDto) {
    if (user.email !== null) {
      return this.prisma.user.update({
        where: { email: user.email },
        data: {
          image: createUserDto.image,
        },
      });
    } else {
      return this.prisma.user.create({ data: createUserDto });
    }
  }
}
