import { Injectable } from '@nestjs/common';
import { CreateDrawDto } from './dto/create-draw.dto';
import { PrismaService } from '../prisma/prisma.service';

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

  findOne(id: number) {
    return this.prisma.raffle.findUnique({
      where: { id },
      include: {
        tickets: {
          where: {
            status: 'UNAVAILABLE',
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
