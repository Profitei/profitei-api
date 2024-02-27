import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ArmesService } from './armes.service';
import { CreateArmeDto } from './dto/create-arme.dto';
import { UpdateArmeDto } from './dto/update-arme.dto';

@Controller('armes')
export class ArmesController {
  constructor(private readonly armesService: ArmesService) {}

  @Post()
  create(@Body() createArmeDto: CreateArmeDto) {
    return this.armesService.create(createArmeDto);
  }

  @Get()
  findAll() {
    return this.armesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.armesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArmeDto: UpdateArmeDto) {
    return this.armesService.update(+id, updateArmeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.armesService.remove(+id);
  }
}
