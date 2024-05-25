import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  DiskHealthIndicator,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaOrmHealthIndicator } from './prismaorm.health';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthCheckService: HealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: HttpHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: PrismaOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: DiskHealthIndicator,
          useValue: {
            checkStorage: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn().mockResolvedValue({}),
            checkRSS: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    healthController = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(healthController).toBeDefined();
  });

  it('should check health and return result', async () => {
    const result: HealthCheckResult = {
      status: 'ok',
      info: {},
      error: {},
      details: {},
    };
    jest.spyOn(healthCheckService, 'check').mockResolvedValue(result);

    const health = await healthController.check();

    expect(health).toBe(result);
    expect(healthCheckService.check).toHaveBeenCalledWith([
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    ]);
  });
});
