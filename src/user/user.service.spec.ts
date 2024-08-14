import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { mockCreateUser, mockVolatileValues } from './user.mock';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockDate = new Date('2022-01-01');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '123456789',
        created: new Date(),
        tradelink: '',
      };

      const createdUser = mockCreateUser();

      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue({ ...createdUser, ...mockVolatileValues() });

      const result = await service.create(createUserDto);

      expect(result).toEqual({ ...createdUser, ...mockVolatileValues() });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
      expect(prismaService.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          cpf: '123456789',
          image: 'pic.png',
          created: new Date(),
          modified: new Date(),
          tradelink:
            'https://steamcommunity.com/tradeoffer/new/?partner=123456789&',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          cpf: '1234567891',
          image: 'pic.png',
          created: new Date(),
          modified: new Date(),
          tradelink:
            'https://steamcommunity.com/tradeoffer/new/?partner=123456789&',
        },
      ];

      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '123456789',
        image: 'pic.png',
        created: new Date(),
        modified: new Date(),
        tradelink:
          'https://steamcommunity.com/tradeoffer/new/?partner=123456789&',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        email: 'updated.email@example.com',
        cpf: '987654321',
        modified: new Date(),
        tradelink:
          'https://steamcommunity.com/tradeoffer/new/?partner=123456789&',
      };

      const updatedUser = mockCreateUser();

      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({ ...updatedUser, ...mockVolatileValues() });

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual({ ...updatedUser, ...mockVolatileValues() });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '123456789',
        image: 'pic.png',
        created: new Date(),
        modified: new Date(),
        tradelink:
          'https://steamcommunity.com/tradeoffer/new/?partner=123456789&',
      };

      jest.spyOn(prismaService.user, 'delete').mockResolvedValue(mockUser);

      const result = await service.remove(userId);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaService.user.delete).toHaveBeenCalledTimes(1);
    });
  });
});
