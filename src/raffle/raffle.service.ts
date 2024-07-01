import { Injectable, Logger } from '@nestjs/common';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { PrismaService } from '../prisma/prisma.service';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AvailableDto } from '../enums/available.dto';

@Injectable()
export class RaffleService {
  private nicknames: string[];
  private readonly logger = new Logger(RaffleService.name);

  constructor(private readonly prisma: PrismaService) {
    this.loadNicknames();
  }

  create(createRaffleDto: CreateRaffleDto) {
    const raffleCreateInput = this.mapDtoToPrismaInput(createRaffleDto);
    return this.prisma.raffle.create({
      data: raffleCreateInput,
    });
  }
  findAll() {
    return this.prisma.raffle.findMany({
      include: {
        category: true,
        properties: true,
        tickets: true,
      },
    });
  }

  findAllSummary() {
    return this.prisma.raffle.findMany({
      include: {
        category: true,
      },
      where: {
        status: AvailableDto.AVAILABLE,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.raffle.findUnique({
      where: { id },
      include: {
        category: true,
        properties: true,
        tickets: true,
      },
    });
  }

  update(id: number, updateRaffleDto: UpdateRaffleDto) {
    return `This action updates a #${updateRaffleDto.categoryId} raffle`;
  }

  remove(id: number) {
    return this.prisma.raffle.delete({ where: { id } });
  }

  private mapDtoToPrismaInput(dto: CreateRaffleDto) {
    const prismaInput: CreateRafflePrismaInput = {
      name: dto.name,
      image: dto.image,
      price: dto.price,
      category: {
        connect: {
          id: dto.categoryId,
        },
      },
      status: AvailableDto.AVAILABLE,
      properties: this.createProperties(dto.properties),
      tickets: this.createTickets(dto.quantity),
    };

    return prismaInput;
  }

  private createProperties(properties: Record<string, any>[]) {
    const data = properties.map((property) => ({
      name: Object.keys(property)[0],
      value: Object.values(property)[0],
    }));

    return { createMany: { data } };
  }

  private createTickets(quantity: number) {
    const data = Array.from({ length: quantity }, (_, index) => ({
      name: this.nicknames[index] || `Ticket ${index + 1}`,
      winner: false,
    }));

    return { createMany: { data } };
  }
  private loadNicknames() {
    this.logger.log(
      'Path: ' + join(process.cwd(), 'data/csgo_pro_nicknames.json'),
    );
    this.nicknames = JSON.parse(
      readFileSync(join(process.cwd(), 'data/csgo_pro_nicknames.json'), 'utf8'),
    );
  }
}

export interface CreateRafflePrismaInput {
  name: string;
  image: string;
  price: number;
  category: {
    connect: {
      id: number;
    };
  };
  status: AvailableDto;
  properties: any;
  tickets: any;
}
