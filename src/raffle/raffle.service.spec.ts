import { Test, TestingModule } from '@nestjs/testing';
import { CreateRafflePrismaInput, RaffleService } from './raffle.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import {
  mockCreateRaffle,
  mockExpectedCreateRaffle,
  mockExpectedFindAllRaffle,
  mockCalledWith,
} from './raffle.mock';

describe('RaffleService', () => {
  let service: RaffleService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RaffleService, PrismaService],
    }).compile();

    service = module.get<RaffleService>(RaffleService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new raffle', async () => {
      const createRaffleDto: CreateRaffleDto = mockCreateRaffle();
      const expectedResult = mockExpectedCreateRaffle();
      const mockCalledWithInput: CreateRafflePrismaInput = mockCalledWith();

      jest
        .spyOn(prismaService.raffle, 'create')
        .mockResolvedValue(expectedResult);

      const result = await service.create(createRaffleDto);

      expect(result).toEqual(expectedResult);
      expect(prismaService.raffle.create).toHaveBeenCalledWith({
        data: mockCalledWithInput,
      });
      expect(prismaService.raffle.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all raffles', async () => {
      const expectedResult = mockExpectedFindAllRaffle();

      jest
        .spyOn(prismaService.raffle, 'findMany')
        .mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(prismaService.raffle.findMany).toHaveBeenCalled();
    });
  });

  // Add more test cases for other methods in the RaffleService class
});
