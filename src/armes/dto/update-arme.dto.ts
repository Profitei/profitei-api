import { PartialType } from '@nestjs/swagger';
import { CreateArmeDto } from './create-arme.dto';

export class UpdateArmeDto extends PartialType(CreateArmeDto) {}
