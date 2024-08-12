import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeviceTokenDto {
  @ApiProperty({ example: 'device-token', description: 'The device token' })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}
