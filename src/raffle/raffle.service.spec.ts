import { Test, TestingModule } from '@nestjs/testing';
import { RaffleService, RaffleStatus } from './raffle.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';

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
      const createRaffleDto: CreateRaffleDto = {
        name: 'Raffle Test',
        image: 'none',
        price: 5,
        quantity: 5,
        properties: [
          { name: 'Property 1', value: 'Value 1' },
          { name: 'Property 2', value: 'Value 2' },
        ],
      };

      const expectedResult = {
        name: 'Raffle Test',
        image: 'none',
        price: 5,
        Tickets: [
          {
            id: 1,
            number: 1,
            raffleId: 1,
          },
          {
            id: 2,
            number: 2,
            raffleId: 1,
          },
          {
            id: 3,
            number: 3,
            raffleId: 1,
          },
          {
            id: 4,
            number: 4,
            raffleId: 1,
          },
          {
            id: 5,
            number: 5,
            raffleId: 1,
          },
        ],
        properties: [
          {
            id: 1,
            name: 'Property 1',
            value: 'Value 1',
            raffleId: 1,
          },
        ],
        categoryId: 1,
        status: RaffleStatus.AVAILABLE,
        id: 1,
        categotyId: 1,
        created: new Date(),
        modified: new Date(),
      };

      jest
        .spyOn(prismaService.raffle, 'create')
        .mockResolvedValue(expectedResult);

      const result = await service.create(createRaffleDto);

      expect(result).toEqual(expectedResult);
      expect(prismaService.raffle.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all raffles', async () => {
      const expectedResult = [
        {
          name: 'Raffle Test',
          image: 'none',
          price: 5,
          Tickets: [
            {
              id: 1,
              number: 1,
              raffleId: 1,
            },
            {
              id: 2,
              number: 2,
              raffleId: 1,
            },
            {
              id: 3,
              number: 3,
              raffleId: 1,
            },
            {
              id: 4,
              number: 4,
              raffleId: 1,
            },
            {
              id: 5,
              number: 5,
              raffleId: 1,
            },
          ],
          properties: [
            {
              id: 1,
              name: 'Property 1',
              value: 'Value 1',
              raffleId: 1,
            },
          ],
          categoryId: 1,
          status: RaffleStatus.AVAILABLE,
          id: 1,
          categotyId: 1,
          created: new Date(),
          modified: new Date(),
        },
      ];

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
