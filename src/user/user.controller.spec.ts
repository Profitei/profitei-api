import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { mockCreateUser, mockUsers, mockVolatileValues } from './user.mock';
import { PrismaService } from '../prisma/prisma.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', () => {
      const createUserDto: CreateUserDto = mockCreateUser();
      const expectedUser = { ...mockCreateUser(), ...mockVolatileValues() };

      jest.spyOn(userService, 'create').mockResolvedValue(expectedUser);

      const result = controller.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(Promise.resolve(expectedUser));
      expect(userService.create).toHaveBeenCalledTimes(1);
    });
  });
  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedUsers = mockUsers();
      jest.spyOn(userService, 'findAll').mockResolvedValue(expectedUsers);
      1
      const result = await controller.findAll();

      expect(userService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const userId = '1';
      const expectedUser = { ...mockCreateUser(), ...mockVolatileValues() };

      jest.spyOn(userService, 'findOne').mockResolvedValue(expectedUser);

      const result = await controller.findOne(userId);

      expect(userService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedUser);
      expect(userService.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateUserDto = { name: 'John Doe' };
      const expectedUser = { id: 1, name: 'John Doe', cpf: '2121212', email: 'value', created: new Date(), ...mockVolatileValues() };

      jest.spyOn(userService, 'update').mockResolvedValue(expectedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(expectedUser);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = '1';

      jest.spyOn(userService, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove(userId);

      expect(userService.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
      expect(userService.remove).toHaveBeenCalledTimes(1);
    });
  });



});