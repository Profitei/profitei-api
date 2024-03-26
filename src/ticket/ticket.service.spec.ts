import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TicketService', () => {
  let service: TicketService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: PrismaService,
          useValue: {
            raffle: {
              findUnique: jest.fn().mockResolvedValue({ id: 1 }),
            },
            ticket: {
              findMany: jest.fn().mockResolvedValue([]),
              create: jest.fn().mockResolvedValue({}),
              findUnique: jest.fn().mockResolvedValue([]),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a ticket', async () => {
      const createTicketDto = {
        name: 'Test Ticket',
        winner: true,
        raffleId: 1,
        userId: 1,
      };

      const result = await service.create(createTicketDto);

      expect(result).toBeDefined();
      expect(prismaService.ticket.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of tickets', async () => {
      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(prismaService.ticket.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a ticket by id', async () => {
      const id = 1;
      const result = await service.findOne(id);
      expect(result).toBeDefined();
      expect(prismaService.ticket.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('update', () => {
    it('should update a ticket', async () => {
      const id = 1;
      const updateTicketDto = {
        raffleId: 1,
        userId: 1,
      };
      const result = await service.update(id, updateTicketDto);
      expect(result).toBeDefined();
      expect(prismaService.ticket.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a ticket', async () => {
      const id = 1;
      const result = await service.remove(id);
      expect(result).toBeDefined();
      expect(prismaService.ticket.delete).toHaveBeenCalledTimes(1);
    });
  });
});
