import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'SMG', description: 'The name of the Category' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
