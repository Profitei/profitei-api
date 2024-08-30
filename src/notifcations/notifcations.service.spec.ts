import { Test, TestingModule } from '@nestjs/testing';
import { NotifcationsService } from './notifcations.service';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateNotifcationDto } from './dto/create-notifcation.dto';
import { User } from '../user/entities/user.entity';

describe('NotifcationsService', () => {
  let service: NotifcationsService;
  let prisma: PrismaService;
  let firebase: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotifcationsService,
        {
          provide: PrismaService,
          useValue: {
            deviceToken: {
              findMany: jest.fn(),
            },
            notification: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: FirebaseService,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotifcationsService>(NotifcationsService);
    prisma = module.get<PrismaService>(PrismaService);
    firebase = module.get<FirebaseService>(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification and send it via Firebase to all device tokens', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        cpf: '12345678900',
        image: 'user-image-url',
        created: new Date(),
      };
      
      const createNotifcationDto: CreateNotifcationDto = {
        title: 'Test Notification',
        message: 'This is a test notification',
      };
  
      const deviceTokens = [
        {
          id: 1,
          token: 'device-token-1',
          userId: user.id,
          created: new Date(),
          modified: new Date(),
        },
        {
          id: 2,
          token: 'device-token-2',
          userId: user.id,
          created: new Date(),
          modified: new Date(),
        },
      ];
  
      const createdNotification = {
        id: 1,
        title: 'Test Notification',
        message: 'This is a test notification',
        userId: user.id,
        created: new Date(),
        modified: new Date(),
      };
  
      jest.spyOn(prisma.deviceToken, 'findMany').mockResolvedValue(deviceTokens);
      jest.spyOn(firebase, 'sendNotification').mockResolvedValue(undefined);
      jest.spyOn(prisma.notification, 'create').mockResolvedValue(createdNotification);
  
      const result = await service.create(user, createNotifcationDto);
  
      expect(prisma.deviceToken.findMany).toHaveBeenCalledWith({ where: { userId: user.id } });
      expect(firebase.sendNotification).toHaveBeenCalledTimes(deviceTokens.length);
      deviceTokens.forEach((token) => {
        expect(firebase.sendNotification).toHaveBeenCalledWith(
          token.token,
          createNotifcationDto.title,
          createNotifcationDto.message,
        );
      });
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          title: createNotifcationDto.title,
          message: createNotifcationDto.message,
          userId: user.id,
        },
      });
      expect(result).toEqual(createdNotification);
    });
  });

  describe('findAll', () => {
    it('should return all notifications for the user', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        cpf: '12345678900',
        image: 'user-image-url',
        created: new Date(),
      };
      
      const notifications = [
        { id: 1, title: 'Test 1', message: 'Message 1', userId: user.id, created: new Date(), modified: new Date() },
        { id: 2, title: 'Test 2', message: 'Message 2', userId: user.id, created: new Date(), modified: new Date() },
      ];

      jest.spyOn(prisma.notification, 'findMany').mockResolvedValue(notifications);

      const result = await service.findAll(user);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({ where: { userId: user.id } });
      expect(result).toEqual(notifications);
    });
  });

  describe('findOne', () => {
    it('should return a single notification for the user', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        cpf: '12345678900',
        image: 'user-image-url',
        created: new Date(),
      };
      
      const notification = { id: 1, title: 'Test', message: 'Message', userId: user.id, created: new Date(), modified: new Date() };

      jest.spyOn(prisma.notification, 'findUnique').mockResolvedValue(notification);

      const result = await service.findOne(user, 1);

      expect(prisma.notification.findUnique).toHaveBeenCalledWith({ where: { id: 1, userId: user.id } });
      expect(result).toEqual(notification);
    });
  });

  describe('remove', () => {
    it('should remove a notification for the user', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        cpf: '12345678900',
        image: 'user-image-url',
        created: new Date(),
      };
      
      const notification = { id: 1, title: 'Test', message: 'Message', userId: user.id, created: new Date(), modified: new Date() };

      jest.spyOn(prisma.notification, 'delete').mockResolvedValue(notification);

      const result = await service.remove(user, 1);

      expect(prisma.notification.delete).toHaveBeenCalledWith({ where: { id: 1, userId: user.id } });
      expect(result).toEqual(notification);
    });
  });
});
