import { Test, TestingModule } from '@nestjs/testing';
import { DrawService } from './draw.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DrawService', () => {
  let service: DrawService;
  let prisma: PrismaService;

  const mockPrismaService = {
    ticket: {
      update: jest.fn().mockResolvedValue({
        id: 1,
        winner: true,
        raffleId: 1,
      }),
    },
    raffle: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, name: 'Raffle 1', status: 'AWAITING_DRAW' },
        { id: 2, name: 'Raffle 2', status: 'AWAITING_DRAW' },
      ]),
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Raffle 1',
        status: 'AWAITING_DRAW',
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrawService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DrawService>(DrawService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should update the ticket and set winner to true', async () => {
      const dto = { ticketId: 1 };
      const result = await service.create(dto);
      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: dto.ticketId },
        data: { winner: true },
      });
      expect(result).toEqual({
        id: 1,
        winner: true,
        raffleId: 1,
      });
    });
  });

  describe('findAll', () => {
    it('should return all raffles with status AWAITING_DRAW', async () => {
      const result = await service.findAll();
      expect(prisma.raffle.findMany).toHaveBeenCalledWith({
        where: { status: 'AWAITING_DRAW' },
      });
      expect(result).toEqual([
        { id: 1, name: 'Raffle 1', status: 'AWAITING_DRAW' },
        { id: 2, name: 'Raffle 2', status: 'AWAITING_DRAW' },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a single raffle', async () => {
      const result = await service.findOne(1);
      expect(prisma.raffle.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({
        id: 1,
        name: 'Raffle 1',
        status: 'AWAITING_DRAW',
      });
    });
  });

  describe('remove', () => {
    it('should return a message saying the draw is removed', () => {
      const result = service.remove(1);
      expect(result).toBe('This action removes a #1 draw');
    });
  });
});
