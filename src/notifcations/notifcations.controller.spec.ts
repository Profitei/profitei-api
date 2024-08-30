import { Test, TestingModule } from '@nestjs/testing';
import { NotifcationsController } from './notifcations.controller';
import { NotifcationsService } from './notifcations.service';
import { CreateNotifcationDto } from './dto/create-notifcation.dto';

describe('NotifcationsController', () => {
  let controller: NotifcationsController;
  let service: NotifcationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotifcationsController],
      providers: [
        {
          provide: NotifcationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotifcationsController>(NotifcationsController);
    service = module.get<NotifcationsService>(NotifcationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call create on the service with correct parameters', async () => {
      const req = { user: { id: 1 } };
      const createNotifcationDto: CreateNotifcationDto = { title: 'Test', message: 'Message' };
      const result = { id: 1, userId:1, created: new Date(), modified: new Date(), ...createNotifcationDto };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(req, createNotifcationDto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(req.user, createNotifcationDto);
    });
  });

  describe('findAll', () => {
    it('should call findAll on the service with correct parameters', async () => {
      const req = { user: { id: 1 } };
      const result = {
        id: 1,
        title: 'Test Title',
        message: 'Test Message',
        userId: 123,
        created: new Date(),
        modified: new Date(),
      };

      jest.spyOn(service, 'findAll').mockResolvedValue([result]);

      expect(await controller.findAll(req)).toEqual([result]);
      expect(service.findAll).toHaveBeenCalledWith(req.user);
    });
  });

  describe('findOne', () => {
    it('should call findOne on the service with correct parameters', async () => {
      const req = { user: { id: 1 } };
      const id = '1';
      const result = {
        id: 1,
        title: 'Test Title',
        message: 'Test Message',
        userId: 123,
        created: new Date(), // Adicione a propriedade created
        modified: new Date(), // Adicione a propriedade modified
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(req, id)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(req.user, +id);
    });
  });

  describe('remove', () => {
    it('should call remove on the service with correct parameters', async () => {
      const req = { user: { id: 1 } };
      const id = '1';
      const result = {
        id: 1,
        title: 'Test Title',
        message: 'Test Message',
        userId: 123,
        created: new Date(), // Adicione a propriedade created
        modified: new Date(), // Adicione a propriedade modified
      };

      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(req, id)).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(req.user, +id);
    });
  });
});
