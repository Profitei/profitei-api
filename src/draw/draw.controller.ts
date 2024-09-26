import { Controller, Get, Post, Body, Param, Delete, Request } from '@nestjs/common';
import { DrawService } from './draw.service';
import { CreateDrawDto } from './dto/create-draw.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('draw')
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

  @Get('all-by-user')
  async findAllByUser(@Request() req) {
    const user = req.user;
    return await this.drawService.findAllByUser(user);
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
