import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
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
      { float: '0.1402356476' },
      { Rarity: 'Covert' },
      { Pattern: '945' },
      { MarketPrice: '546.43' },
    ],
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  @IsArray()
  @IsOptional()
  properties?: Record<string, any>[];

  @ApiProperty({ example: 'rifle' })
  @IsNumber()
  categoryId: number;
}
