import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: [1, 2, 3] })
  ticketsId: number[];
}
