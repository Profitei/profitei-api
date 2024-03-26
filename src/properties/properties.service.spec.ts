import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PrismaService,
          useValue: {
            raffle: {
              findUnique: jest.fn().mockResolvedValue({ id: 1 }),
            },
            properties: {
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

    service = module.get<PropertiesService>(PropertiesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should create a property', async () => {
      const createPropertyDto: CreatePropertyDto = {
        name: 'Test Property',
        value: 'value',
        raffleId: 1,
      };

      const result = await service.create(createPropertyDto);
      expect(result).toBeDefined();
      expect(prismaService.properties.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of properties', async () => {
      const result = await service.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(prismaService.properties.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a property by id', async () => {
      const id = 1;

      const result = await service.findOne(id);

      expect(result).toBeDefined();
      expect(prismaService.properties.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.properties.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('update', () => {
    it('should update a property by id', async () => {
      const id = 1;
      const updatePropertyDto: UpdatePropertyDto = {
        // Provide the necessary data for updatePropertyDto
      };

      const result = await service.update(id, updatePropertyDto);
      expect(result).toBeDefined();
      expect(prismaService.properties.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a property by id', async () => {
      const id = 1;

      const result = await service.remove(id);

      expect(result).toBeDefined();
      expect(prismaService.properties.delete).toHaveBeenCalledTimes(1);
    });
  });
});
