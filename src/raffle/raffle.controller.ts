import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RaffleService } from './raffle.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { ApiCreatedResponse, ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('api-key')
@ApiTags('raffle')
@Controller('raffle')
export class RaffleController {
  constructor(private readonly raffleService: RaffleService) {}
  @ApiCreatedResponse({ type: CreateRaffleDto })
  @Post()
  create(@Body() createRaffleDto: CreateRaffleDto) {
    return this.raffleService.create(createRaffleDto);
  }

  @Get()
  findAll() {
    return this.raffleService.findAll();
  }

  @Get('summary')
  summary() {
    return this.raffleService.findAllSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.raffleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRaffleDto: UpdateRaffleDto) {
    return this.raffleService.update(+id, updateRaffleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.raffleService.remove(+id);
  }
}
