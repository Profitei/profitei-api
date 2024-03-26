import { Test, TestingModule } from '@nestjs/testing';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import { AvaliableDto } from '../enums/avaliable.dto';

describe('TicketController', () => {
  let controller: TicketController;
  let service: TicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [TicketService, PrismaService],
    }).compile();

    controller = module.get<TicketController>(TicketController);
    service = module.get<TicketService>(TicketService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ticket', async () => {
      const createTicketDto = {
        name: 'Test Ticket',
        winner: true,
        raffleId: 1,
        status: AvaliableDto.AVAILABLE,
        userId: 1,
      };

      const expected = {
        id: 1,
        name: 'Test Ticket',
        winner: true,
        raffleId: 1,
        status: Status.AVAILABLE,
        userId: 1,
        modified: new Date(),
        created: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(expected);
      const result = await controller.create(createTicketDto);
      expect(service.create).toHaveBeenCalledWith(createTicketDto);
      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of tickets', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a ticket by ID', async () => {
      const expected = {
        id: 1,
        name: 'Test Ticket',
        winner: true,
        raffleId: 1,
        status: Status.AVAILABLE,
        userId: 1,
        modified: new Date(),
        created: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expected);
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a ticket by ID', async () => {
      const userId = '1';
      const updateUserDto = { name: 'John Doe' };
      const expected = {
        id: 1,
        name: 'Test Ticket',
        winner: true,
        raffleId: 1,
        status: Status.AVAILABLE,
        userId: 1,
        modified: new Date(),
        created: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(expected);
      const result = await controller.update(userId, updateUserDto);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a ticket by ID', async () => {
      const userId = '1';
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);
      const result = await controller.remove(userId);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
