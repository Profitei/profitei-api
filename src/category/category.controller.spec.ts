import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';
describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [CategoryService, PrismaService],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'SMG',
      };

      const createdCategory = {
        name: 'SMG',
        id: 1,
      }; // Replace with the expected created category object

      jest.spyOn(service, 'create').mockResolvedValue(createdCategory);

      const result = await controller.create(createCategoryDto);

      expect(result).toEqual(createdCategory);
    });
  });

  describe('createMany', () => {
    it('should create multiple categories', async () => {
      const createCategoryDto: CreateCategoryDto[] = [
        { name: 'SMG' },
        { name: 'Pistol' },
      ];

      const createdCategories = [
        {
          name: 'SMG',
          id: 1,
        },
        {
          name: 'Pistol',
          id: 2,
        },
      ]; // Replace with the expected created categories array

      jest
        .spyOn(service, 'createMany')
        .mockResolvedValue({ count: createdCategories.length });

      const result = await controller.createMany(createCategoryDto);

      expect(result).toEqual({ count: createdCategories.length });
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories = []; // Replace with the expected categories array

      jest.spyOn(service, 'findAll').mockResolvedValue(categories);

      const result = await controller.findAll();

      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return a category by ID', async () => {
      const categoryId = '123'; // Replace with the desired category ID
      const category = {
        name: 'SMG',
        id: 1,
      }; // Replace with the expected category object

      jest.spyOn(service, 'findOne').mockResolvedValue(category);

      const result = await controller.findOne(categoryId);

      expect(result).toEqual(category);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const categoryId = '123'; // Replace with the desired category ID
      const updateCategoryDto: UpdateCategoryDto = {
        // Provide the necessary data for updating a category
      };

      const updatedCategory = { id: Number(categoryId), name: 'Updated SMG' }; // Replace with the expected updated category object

      jest.spyOn(service, 'update').mockResolvedValue(updatedCategory);

      const result = await controller.update(categoryId, updateCategoryDto);

      expect(result).toEqual(updatedCategory);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const categoryId = '123'; // Replace with the desired category ID

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove(categoryId);

      expect(result).toBeUndefined();
    });
  });
});
