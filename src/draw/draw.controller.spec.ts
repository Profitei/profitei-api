import { Test, TestingModule } from '@nestjs/testing';
import { DrawController } from './draw.controller';
import { DrawService } from './draw.service';
import { CreateDrawDto } from './dto/create-draw.dto';

describe('DrawController', () => {
  let controller: DrawController;
  let service: DrawService;

  const mockDrawService = {
    create: jest.fn((dto: CreateDrawDto) => {
      return {
        id: Date.now(),
        ...dto,
        createdAt: new Date(),
      };
    }),
    findAll: jest.fn(() => {
      return [
        {
          id: 1,
          name: 'Test Draw 1',
          status: 'completed',
          createdAt: new Date(),
        },
        {
          id: 2,
          name: 'Test Draw 2',
          status: 'pending',
          createdAt: new Date(),
        },
      ];
    }),
    findOne: jest.fn((id: number) => {
      return {
        id,
        name: `Test Draw ${id}`,
        status: 'pending',
        createdAt: new Date(),
      };
    }),
    remove: jest.fn((id: number) => {
      return {
        id,
        name: `Deleted Draw ${id}`,
        status: 'deleted',
        createdAt: new Date(),
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrawController],
      providers: [
        {
          provide: DrawService,
          useValue: mockDrawService,
        },
      ],
    }).compile();

    controller = module.get<DrawController>(DrawController);
    service = module.get<DrawService>(DrawService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a draw with pending status', async () => {
      const dto: CreateDrawDto = { ticketId: 1 };
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        id: expect.any(Number),
        ticketId: 1,
        createdAt: expect.any(Date),
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of draws with status and creation date', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 1,
          name: 'Test Draw 1',
          status: 'completed',
          createdAt: expect.any(Date),
        },
        {
          id: 2,
          name: 'Test Draw 2',
          status: 'pending',
          createdAt: expect.any(Date),
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a single draw with status and creation date', async () => {
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 1,
        name: 'Test Draw 1',
        status: 'pending',
        createdAt: expect.any(Date),
      });
    });
  });

  describe('remove', () => {
    it('should remove a draw and return deleted status', async () => {
      const result = controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 1,
        name: 'Deleted Draw 1',
        status: 'deleted',
        createdAt: expect.any(Date),
      });
    });
  });
});
