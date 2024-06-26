import { Controller, Get, Inject } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaOrmHealthIndicator } from './prismaorm.health';
import { Public, NoAuth } from '../decorators/public.decorator';

@Controller('health')
@Public()
@NoAuth()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    @Inject(PrismaOrmHealthIndicator)
    private db: PrismaOrmHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => this.http.pingCheck('api', 'http://localhost:3000/api'),
      async () =>
        this.disk.checkStorage('diskStorage', {
          thresholdPercent: 0.9,
          path: '/',
        }),
      async () => this.db.pingCheck('healthcheckdemo'),
      async () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      async () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }
}
