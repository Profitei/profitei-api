import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsDate,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the User' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'email@email.com`',
    description: 'The email of the User',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '12345678900', description: 'The cpf of the User' })
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiProperty({ example: 'pic.jpg', description: 'The image of the User' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    example: 'https://my-trade-link',
    description: 'The tradelink of the User',
  })
  @IsString()
  @IsNotEmpty()
  tradelink: string;

  @IsDate()
  @IsNotEmpty()
  created: Date;

  @IsDate()
  @IsOptional()
  modified?: Date;
}
