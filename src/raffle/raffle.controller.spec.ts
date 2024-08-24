import { Test, TestingModule } from '@nestjs/testing';
import { RaffleController } from './raffle.controller';
import { RaffleService } from './raffle.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { SummaryResponseDto } from './dto/summary-response.dto';

describe('RaffleController', () => {
  let controller: RaffleController;
  let service: RaffleService;

  const mockRaffleService = {
    create: jest.fn().mockImplementation((dto) => dto),
    findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Raffle 1' }]),
    findAllSummary: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Raffle 1',
        category: { name: 'Category 1' },
        price: 100,
        isFeatured: true,
      },
    ]),
    findOne: jest
      .fn()
      .mockImplementation((id: number) => ({ id, name: `Raffle ${id}` })),
    update: jest.fn().mockImplementation((id: number, dto) => ({ id, ...dto })),
    remove: jest.fn().mockImplementation((id: number) => ({ id })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaffleController],
      providers: [
        {
          provide: RaffleService,
          useValue: mockRaffleService,
        },
      ],
    }).compile();

    controller = module.get<RaffleController>(RaffleController);
    service = module.get<RaffleService>(RaffleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a raffle', async () => {
      const dto: CreateRaffleDto = {
        name: 'Test Raffle',
        image: 'path/to/image.jpg',
        price: 10,
        quantity: 10,
        categoryId: 1,
        isFeatured: true,
        steamPrice: 100,
      };
      expect(await controller.create(dto)).toEqual(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of raffles', async () => {
      expect(await controller.findAll()).toEqual([{ id: 1, name: 'Raffle 1' }]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('summary', () => {
    it('should return an array of summary raffles', async () => {
      const expectedSummary = [
        new SummaryResponseDto({
          id: 1,
          name: 'Raffle 1',
          category: { name: 'Category 1' },
          price: 100,
          isFeatured: true,
        }),
      ];
      expect(await controller.summary()).toEqual(expectedSummary);
      expect(service.findAllSummary).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single raffle', async () => {
      expect(await controller.findOne('1')).toEqual({
        id: 1,
        name: 'Raffle 1',
      });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a raffle', async () => {
      const dto: UpdateRaffleDto = { name: 'Updated Raffle' };
      expect(await controller.update('1', dto)).toEqual({ id: 1, ...dto });
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a raffle', async () => {
      expect(await controller.remove('1')).toEqual({ id: 1 });
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
