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
import { Public } from '../decorators/public.decorator';
import { SummaryResponseDto } from './dto/summary-response.dto';

@ApiSecurity('api-key')
@ApiTags('raffle')
@Controller('raffle')
@Public()
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
  async summary() {
    const response = await this.raffleService.findAllSummary();
    return response.map((raffle) => new SummaryResponseDto(raffle));
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
