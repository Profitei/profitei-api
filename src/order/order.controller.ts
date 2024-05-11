import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.dto';

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
  async findAll() {
    const responses = await this.orderService.findAll();
    return responses.map((response) => new ResponseOrderDto(response));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const response = await this.orderService.findOne(+id);
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

  @Get('findByStatusAndUser')
  async findByStatusAndUser(
    @Query('orderStatus') orderStatus?: OrderStatus,
    @Query('userId') userId?: number,
  ) {
    const responses = await this.orderService.findAllOrdersByStatusAndUser(
      orderStatus,
      userId,
    );
    return responses.map((response) => new ResponseOrderDto(response));
  }
}
