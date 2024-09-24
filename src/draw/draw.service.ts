import { Injectable } from '@nestjs/common';
import { CreateDrawDto } from './dto/create-draw.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class DrawService {
  constructor(private readonly prisma: PrismaService) {}

  create(createDrawDto: CreateDrawDto) {
    return this.prisma.ticket.update({
      where: { id: createDrawDto.ticketId },
      data: { winner: true },
    });
  }

  findAll() {
    return this.prisma.raffle.findMany({
      where: { status: 'AWAITING_DRAW' },
    });
  }

  async findAllByUser(user: User) {
    const raffles = await this.prisma.raffle.findMany({
      where: { status: { in: ['AWAITING_DRAW', 'DRAWN'] } },
      include: {
        tickets: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    const response = {
      awaitingDraw: raffles.filter((raffle) => raffle.status === 'AWAITING_DRAW'),
      drawn: raffles.filter((raffle) => raffle.status === 'DRAWN'),
    };

    return response;    
  }

  findOne(id: number) {
    return this.prisma.raffle.findUnique({
      where: { id },
      include: {
        tickets: {
          where: {
            status: 'AWAITING_DRAW',
          },
          include: {
            user: true,
          },
        },
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} draw`;
  }
}
