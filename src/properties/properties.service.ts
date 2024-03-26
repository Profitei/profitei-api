import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPropertyDto: CreatePropertyDto) {
    const { raffleId, ...rest } = createPropertyDto;
    return this.prisma.properties.create({
      data: {
        ...rest,
        Raffle: { connect: { id: raffleId } },
      },
    });
  }

  findAll() {
    return this.prisma.properties.findMany();
  }

  findOne(id: number) {
    return this.prisma.properties.findUnique({ where: { id } });
  }

  update(id: number, updatePropertyDto: UpdatePropertyDto) {
    const { raffleId, ...rest } = updatePropertyDto;
    return this.prisma.properties.update({
      where: { id },
      data: {
        ...rest,
        Raffle: { connect: { id: raffleId } },
      },
    });
  }

  remove(id: number) {
    return this.prisma.properties.delete({ where: { id } });
  }
}
