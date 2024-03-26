import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTicketDto: CreateTicketDto) {
    const { raffleId, userId, ...rest } = createTicketDto;
    return this.prisma.ticket.create({
      data: {
        ...rest,
        Raffle: { connect: { id: raffleId } },
        user: { connect: { id: userId } },
      },
    });
  }

  findAll() {
    return this.prisma.ticket.findMany();
  }

  findOne(id: number) {
    return this.prisma.ticket.findUnique({ where: { id } });
  }

  update(id: number, updateTicketDto: UpdateTicketDto) {
    const { raffleId, userId, ...rest } = updateTicketDto;
    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...rest,
        Raffle: { connect: { id: raffleId } },
        user: { connect: { id: userId } },
      },
    });
  }

  remove(id: number) {
    return this.prisma.ticket.delete({ where: { id } });
  }
}
