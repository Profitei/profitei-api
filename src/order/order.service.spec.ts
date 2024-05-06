import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoService } from './mercado-pago.service';
import { OrderStatus } from '../enums/order-status.dto';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;
  beforeEach(async () => {
    const mockDate = new Date('2022-01-01T00:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderService, PrismaService, MercadoPagoService],
    }).compile();
    prismaService = module.get<PrismaService>(PrismaService);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllPendingOrders', () => {
    it('should return all pending orders', async () => {
      const expectedOrders = [
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: new Date(),
          items: [],
          details: {},
          modified: new Date(),
          paymentData: {},
        },
        {
          id: 2,
          status: OrderStatus.PENDING,
          created: new Date(),
          items: [],
          details: {},
          modified: new Date(),
          paymentData: {},
        },
      ];
      jest
        .spyOn(prismaService.order, 'findMany')
        .mockResolvedValue(expectedOrders);

      const orders = await service.findAllPendingOrders();
      expect(orders).toEqual([
        {
          created: new Date('2022-01-01T00:00:00Z'),
          id: 1,
          paymentData: {},
          status: 'PENDING',
          tickets: [],
        },
        {
          created: new Date('2022-01-01T00:00:00Z'),
          id: 2,
          paymentData: {},
          status: 'PENDING',
          tickets: [],
        },
      ]);
      expect(prismaService.order.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return all pending orders for a specific user', async () => {
      const userId = 1;
      const expectedOrders = [
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: new Date(),
          items: [],
          details: {},
          modified: new Date(),
          paymentData: {},
        },
        {
          id: 2,
          status: OrderStatus.PENDING,
          created: new Date(),
          items: [],
          details: {},
          modified: new Date(),
          paymentData: {},
        },
      ];
      jest
        .spyOn(prismaService.order, 'findMany')
        .mockResolvedValue(expectedOrders);

      const orders = await service.findAllPendingOrders(
        OrderStatus.PENDING,
        userId,
      );

      expect(orders).toEqual([
        {
          created: new Date('2022-01-01T00:00:00Z'),
          id: 1,
          paymentData: {},
          status: 'PENDING',
          tickets: [],
        },
        {
          created: new Date('2022-01-01T00:00:00Z'),
          id: 2,
          paymentData: {},
          status: 'PENDING',
          tickets: [],
        },
      ]);
      expect(prismaService.order.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
