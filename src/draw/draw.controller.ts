import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { DrawService } from './draw.service';
import { CreateDrawDto } from './dto/create-draw.dto';

@Controller('draw')
export class DrawController {
  constructor(private readonly drawService: DrawService) {}

  @Post()
  create(@Body() createDrawDto: CreateDrawDto) {
    return this.drawService.create(createDrawDto);
  }

  @Get()
  findAll() {
    return this.drawService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drawService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drawService.remove(+id);
  }
}
