import { Controller, Get, Post, Body, Param, Delete, Request } from '@nestjs/common';
import { NotifcationsService } from './notifcations.service';
import { CreateNotifcationDto } from './dto/create-notifcation.dto';

@Controller('notifcations')
export class NotifcationsController {
  constructor(private readonly notifcationsService: NotifcationsService) {}

  @Post()
  create(@Request() req, @Body() createNotifcationDto: CreateNotifcationDto) {
    return this.notifcationsService.create(req.user, createNotifcationDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.notifcationsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.notifcationsService.findOne(req.user, +id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.notifcationsService.remove(req.user,+id);
  }
}
