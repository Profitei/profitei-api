import { Injectable, Logger } from '@nestjs/common';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { PrismaService } from '../prisma/prisma.service';
import { readFileSync } from 'fs';

@Injectable()
export class RaffleService {
  private nicknames: { name: string }[];
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
    return this.prisma.raffle.findMany();
  }

  findOne(id: number) {
    return this.prisma.raffle.findUnique({
      where: { id },
    });
  }

  update(id: number, updateRaffleDto: UpdateRaffleDto) {
    return `This action updates a #${id} raffle`;
  }

  remove(id: number) {
    return this.prisma.raffle.delete({ where: { id } });
  }

  private mapDtoToPrismaInput(dto: CreateRaffleDto) {
    const prismaInput = {
      name: dto.name,
      image: dto.image,
      price: dto.price,
      category: {
        connect: {
          id: this.someCategoryIdFunction(dto.category),
        },
      },
      status: RaffleStatus.AVAILABLE,
      properties: {
        createMany: {
          data: dto.properties?.map((property) => ({
            name: property.name,
            value: property.value,
          })),
        },
      },
      tickets: this.createTickets(dto.quantity),
    };

    return prismaInput;
  }

  private createTickets(quantity: number) {
    const data = Array.from({ length: quantity }, (_, index) => ({
      name: this.nicknames[index]?.name || `Ticket ${index + 1}`,
      winner: false,
    }));

    return { createMany: { data } };
  }

  private someCategoryIdFunction(categoryName?: string): number {
    return 1;
  }
  private loadNicknames() {
    this.nicknames = JSON.parse(
      readFileSync('src/raffle/data/csgo_pro_nicknames.json', 'utf8'),
    );
  }
}

export enum RaffleStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVILABLE = 'UNAVILABLE',
}
