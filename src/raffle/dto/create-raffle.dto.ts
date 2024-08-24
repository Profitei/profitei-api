import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRaffleDto {
  @ApiProperty({ example: 'M4A4 | Asiimov (Field-Tested)' })
  @IsString()
  name: string;

  @ApiProperty({
    example:
      'https://screenshots.cs.money/csmoney2/1a624448e42c286616d27d9ea4bddf58_large_preview.png',
  })
  @IsString()
  image: string;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    example: [
      { Float: '0.1402356476' },
      { Rarity: 'Covert' },
      { Pattern: '945' },
      { MarketPrice: 'R$546.43' },
    ],
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  @IsArray()
  @IsOptional()
  properties?: Record<string, any>[];

  @ApiProperty({ example: '1' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isFeatured: boolean;

  @ApiProperty({ example: 30.0 })
  @IsNumber()
  steamPrice: number;
}
