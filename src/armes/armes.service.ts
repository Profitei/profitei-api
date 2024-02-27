import { Injectable } from '@nestjs/common';
import { CreateArmeDto } from './dto/create-arme.dto';
import { UpdateArmeDto } from './dto/update-arme.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ArmesService {
  constructor(private readonly prisma: PrismaService) { }

  create(createArmeDto: CreateArmeDto) {
    return this.prisma.armes.create({
      data: createArmeDto,
    });
  }

  findAll() {
    return this.prisma.armes.findMany();
  }

  findOne(id: number) {
    return this.prisma.armes.findUnique({
      where: { id },
    });
  }

  update(id: number, updateArmeDto: UpdateArmeDto) {
    return this.prisma.armes.update({
      where: { id },
      data: updateArmeDto,
    });
  }

  remove(id: number) {
    return this.prisma.armes.delete({
      where: { id },
    });
  }
}
