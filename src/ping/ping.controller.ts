import { Controller, Get } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';

@Public()
@Controller('ping')
export class PingController {
  @Get()
  ping() {
    return { status: 'ok' };
  }
}
