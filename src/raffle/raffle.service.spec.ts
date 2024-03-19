import { Test, TestingModule } from '@nestjs/testing';
import { RaffleService } from './raffle.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RaffleService', () => {
  let service: RaffleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RaffleService, PrismaService],
    }).compile();

    service = module.get<RaffleService>(RaffleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
