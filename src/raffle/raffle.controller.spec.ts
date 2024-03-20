import { Test, TestingModule } from '@nestjs/testing';
import { RaffleController } from './raffle.controller';
import { RaffleService } from './raffle.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  mockCreateRaffle,
  mockExpectedCreateRaffle,
  mockExpectedFindAllRaffle,
} from './raffle.mock';

describe('RaffleController', () => {
  let controller: RaffleController;
  let service: RaffleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaffleController],
      providers: [RaffleService, PrismaService],
    }).compile();

    controller = module.get<RaffleController>(RaffleController);
    service = module.get<RaffleService>(RaffleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new raffle', async () => {
      const createRaffleDto = mockCreateRaffle();
      const createdRaffle = mockExpectedCreateRaffle();

      jest.spyOn(service, 'create').mockResolvedValue(createdRaffle);

      const result = await controller.create(createRaffleDto);

      expect(service.create).toHaveBeenCalledWith(createRaffleDto);
      expect(result).toEqual(createdRaffle);
    });
  });

  describe('findAll', () => {
    it('should return an array of raffles', async () => {
      const raffles = [];

      jest.spyOn(service, 'findAll').mockResolvedValue(raffles);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(raffles);
    });
  });
});
