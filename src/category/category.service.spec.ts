import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category', async () => {
    const dto: CreateCategoryDto = { name: 'Test Category' };
    mockPrismaService.category.create.mockResolvedValue(dto);

    expect(await service.create(dto)).toEqual(dto);
    expect(prismaService.category.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should create many categories', async () => {
    const dtos: CreateCategoryDto[] = [
      { name: 'Test Category 1' },
      { name: 'Test Category 2' },
    ];
    mockPrismaService.category.createMany.mockResolvedValue({ count: 2 });

    expect(await service.createMany(dtos)).toEqual({ count: 2 });
    expect(prismaService.category.createMany).toHaveBeenCalledWith({
      data: dtos,
    });
  });

  it('should find all categories', async () => {
    const categories = [{ id: 1, name: 'Category 1' }];
    mockPrismaService.category.findMany.mockResolvedValue(categories);

    expect(await service.findAll()).toEqual(categories);
    expect(prismaService.category.findMany).toHaveBeenCalled();
  });

  it('should find one category', async () => {
    const category = { id: 1, name: 'Category 1' };
    mockPrismaService.category.findUnique.mockResolvedValue(category);

    expect(await service.findOne(1)).toEqual(category);
    expect(prismaService.category.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should update a category', async () => {
    const dto: UpdateCategoryDto = { name: 'Updated Category' };
    const updatedCategory = { id: 1, name: 'Updated Category' };
    mockPrismaService.category.update.mockResolvedValue(updatedCategory);

    expect(await service.update(1, dto)).toEqual(updatedCategory);
    expect(prismaService.category.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
    });
  });

  it('should remove a category', async () => {
    const category = { id: 1, name: 'Category 1' };
    mockPrismaService.category.delete.mockResolvedValue(category);

    expect(await service.remove(1)).toEqual(category);
    expect(prismaService.category.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
