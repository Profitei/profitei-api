import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiSecurity('x-api-key')
@Controller('order')
@ApiTags('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const user = req.user;
    const response = await this.orderService.create(createOrderDto, user);
    return new ResponseOrderDto(response);
  }

  @Get()
  async findAll(@Request() req) {
    const user = req.user;
    const responses = await this.orderService.findAllByUser(user);
    return responses.map((response) => new ResponseOrderDto(response));
  }

  @Get('/all')
  async temp() {
    const responses = await this.orderService.findAll();
    return responses.map((response) => new ResponseOrderDto(response));
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const user = req.user;
    const response = await this.orderService.findOneByUser(+id, user);
    return new ResponseOrderDto(response);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
