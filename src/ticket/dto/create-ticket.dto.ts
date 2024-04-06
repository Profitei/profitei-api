import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { AvailableDto } from '../../enums/available.dto';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  winner: boolean;

  @IsOptional()
  @IsEnum(AvailableDto)
  status?: AvailableDto;

  @IsNotEmpty()
  raffleId: number;

  @IsNotEmpty()
  userId: number;
}
