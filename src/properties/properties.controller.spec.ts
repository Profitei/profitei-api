import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let service: PropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [PropertiesService, PrismaService],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
    service = module.get<PropertiesService>(PropertiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a property', async () => {
      const propertyTicketDto = {
        name: 'Test Ticket',
        value: 'Test Value',
        raffleId: 1,
      };

      const expected = {
        id: 1,
        name: 'Test Ticket',
        value: 'Test Value',
        raffleId: 1,
        modified: new Date(),
        created: new Date(),
      };
      jest.spyOn(service, 'create').mockResolvedValue(expected);
      const result = await controller.create(propertyTicketDto);
      expect(service.create).toHaveBeenCalledWith(propertyTicketDto);
      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all properties', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a property by id', async () => {
      const expected = {
        id: 1,
        name: 'Test Ticket',
        value: 'Test Value',
        raffleId: 1,
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
    it('should update a property', async () => {
      const userId = '1';
      const updateUserDto = { name: 'John Doe' };
      const expected = {
        id: 1,
        name: 'Test Ticket',
        value: 'Test Value',
        raffleId: 1,
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
    it('should remove a property', async () => {
      const userId = '1';
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);
      const result = await controller.remove(userId);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
