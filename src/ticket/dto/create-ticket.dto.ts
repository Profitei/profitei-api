import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { AvaliableDto } from '../../enums/avaliable.dto';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  winner: boolean;

  @IsOptional()
  @IsEnum(AvaliableDto)
  status?: AvaliableDto;

  @IsNotEmpty()
  raffleId: number;

  @IsNotEmpty()
  userId: number;
}
