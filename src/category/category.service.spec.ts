import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService, PrismaService],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'SMG',
      };

      jest
        .spyOn(prismaService.category, 'create')
        .mockResolvedValue({ id: 1, name: 'SMG' });

      const createdCategory = await prismaService.category.create({
        data: createCategoryDto,
      });

      expect(createdCategory).toBeDefined();
      // Add more assertions to validate the created category
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = await prismaService.category.findMany();

      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
    });
  });
});
