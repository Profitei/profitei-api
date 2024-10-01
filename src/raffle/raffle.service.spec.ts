import { Test, TestingModule } from '@nestjs/testing';
import { RaffleService } from './raffle.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  mockCreateRaffle,
  mockExpectedCreateRaffle,
  mockExpectedFindAllRaffle,
  mockCalledWith,
} from './raffle.mock';
import { readFileSync } from 'fs';
import { join } from 'path';

jest.mock('fs');
jest.mock('path');

describe('RaffleService', () => {
  let service: RaffleService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    raffle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockNicknames = ['s1mple', 'ZywOo', 'device', 'NiKo', 'electronic'];

  beforeEach(async () => {
    jest.resetAllMocks();
    (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockNicknames));
    (join as jest.Mock).mockReturnValue('/path/to/nicknames.json');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RaffleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RaffleService>(RaffleService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a raffle', async () => {
      const dto = mockCreateRaffle();
      const expectedResponse = mockExpectedCreateRaffle();
      mockPrismaService.raffle.create.mockResolvedValue(expectedResponse);

      expect(await service.create(dto)).toEqual(expectedResponse);
      expect(prismaService.raffle.create).toHaveBeenCalledWith({
        data: mockCalledWith(),
        include: {
          properties: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all raffles', async () => {
      const expectedResponse = mockExpectedFindAllRaffle();
      mockPrismaService.raffle.findMany.mockResolvedValue(expectedResponse);

      expect(await service.findAll()).toEqual(expectedResponse);
      expect(prismaService.raffle.findMany).toHaveBeenCalledWith({
        include: {
          category: true,
          properties: true,
          tickets: true,
        },
      });
    });
  });

  describe('findAllSummary', () => {
    it('should return all raffle summaries', async () => {
      const expectedResponse = mockExpectedFindAllRaffle();
      mockPrismaService.raffle.findMany.mockResolvedValue(expectedResponse);

      expect(await service.findAllSummary()).toEqual(expectedResponse);
      expect(prismaService.raffle.findMany).toHaveBeenCalledWith({
        include: {
          category: true,
        },
        where: { status: 'AVAILABLE' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single raffle', async () => {
      const expectedResponse = mockExpectedCreateRaffle();
      mockPrismaService.raffle.findUnique.mockResolvedValue(expectedResponse);

      expect(await service.findOne(1)).toEqual(expectedResponse);
      expect(prismaService.raffle.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          category: true,
          properties: true,
          tickets: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a raffle', async () => {
      const expectedResponse = mockExpectedCreateRaffle();
      mockPrismaService.raffle.update.mockResolvedValue(expectedResponse);

      expect(await service.remove(1)).toEqual(expectedResponse);
      expect(prismaService.raffle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'UNAVAILABLE' },
      });
    });
  });
});
