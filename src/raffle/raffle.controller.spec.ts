import { Test, TestingModule } from '@nestjs/testing';
import { RaffleController } from './raffle.controller';
import { RaffleService } from './raffle.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RaffleController', () => {
  let controller: RaffleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaffleController],
      providers: [RaffleService, PrismaService],
    }).compile();

    controller = module.get<RaffleController>(RaffleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
