import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoService } from './mercado-pago.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../user/entities/user.entity';
import { OrderStatus } from '@prisma/client';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;
  let mercadoPagoService: MercadoPagoService;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    ticket: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((fn) =>
      fn({
        order: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
          update: jest.fn(),
          findUnique: jest.fn(),
        },
        ticket: {
          updateMany: jest.fn(),
        },
      }),
    ),
  };

  const mockMercadoPagoService = {
    createPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MercadoPagoService,
          useValue: mockMercadoPagoService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
    mercadoPagoService = module.get<MercadoPagoService>(MercadoPagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const createOrderDto: CreateOrderDto = {
        ticketsId: [1, 2],
      };
      const user: User = {
        id: 1,
        email: 'test@test.com',
        cpf: '12345678900',
      } as User;
      const tickets = [
        {
          id: 1,
          Raffle: { name: 'Raffle 1', price: 50 },
        },
        {
          id: 2,
          Raffle: { name: 'Raffle 2', price: 100 },
        },
      ];
      const paymentResult = { id: 'payment1' };

      mockPrismaService.ticket.findMany.mockResolvedValue(tickets);
      mockMercadoPagoService.createPayment.mockResolvedValue(paymentResult);
      mockPrismaService.order.create.mockResolvedValue({ id: 1 });
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 1,
        status: OrderStatus.PENDING,
        created: new Date(),
        items: tickets,
        details: paymentResult,
      });

      const result = await service.create(createOrderDto, user);

      expect(result).toEqual({
        id: 1,
        status: OrderStatus.PENDING,
        created: expect.any(Date),
        tickets,
        paymentData: paymentResult,
      });
      expect(prismaService.ticket.findMany).toHaveBeenCalledWith({
        where: { id: { in: createOrderDto.ticketsId }, status: 'AVAILABLE' },
        include: { Raffle: true },
      });
      expect(mercadoPagoService.createPayment).toHaveBeenCalledWith({
        transaction_amount: 150,
        description: 'Raffle 1, Raffle 2',
        payment_method_id: 'pix',
        email: user.email,
        identificationType: 'CPF',
        number: user.cpf,
      });
    });

    it('should throw an error if tickets are not available', async () => {
      const createOrderDto: CreateOrderDto = {
        ticketsId: [1, 2],
      };
      const user: User = {
        id: 1,
        email: 'test@test.com',
        cpf: '12345678900',
      } as User;

      mockPrismaService.ticket.findMany.mockResolvedValue([
        {
          id: 1,
          Raffle: { name: 'Raffle 1', price: 50 },
        },
      ]);

      await expect(service.create(createOrderDto, user)).rejects.toThrow(
        'Some tickets are not available',
      );
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const orders = [
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: new Date(),
          items: [
            { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
            { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
          ],
          details: {},
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(orders);

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: expect.any(Date),
          tickets: [
            { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
            { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
          ],
          paymentData: {},
        },
      ]);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        include: { items: { include: { Raffle: true } } },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const order = {
        id: 1,
        status: OrderStatus.PENDING,
        created: new Date(),
        items: [
          { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
          { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
        ],
        details: {},
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      const result = await service.findOne(1);

      expect(result).toEqual({
        id: 1,
        status: OrderStatus.PENDING,
        created: expect.any(Date),
        tickets: [
          { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
          { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
        ],
        paymentData: {},
      });
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { items: { include: { Raffle: true } } },
      });
    });

    it('should throw an error if order is not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow('Order not found');
    });
  });

  describe('cancelPendingOrders', () => {
    it('should cancel pending orders', async () => {
      const pendingOrders = [
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: new Date(),
          items: [{ id: 1 }],
          details: {},
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(pendingOrders);

      await service.cancelPendingOrders();

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        include: { items: true },
      });
    });
  });
  describe('findAllOrdersByStatusAndUser', () => {
    it('should return all orders with the given status and user', async () => {
      const orderStatus = OrderStatus.PENDING;
      const userId = 1;

      const orders = [
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: new Date(),
          items: [
            { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
            { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
          ],
          details: {},
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(orders);

      const result = await service.findAllOrdersByStatusAndUser(
        orderStatus,
        userId,
      );

      expect(result).toEqual([
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: expect.any(Date),
          tickets: [
            { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
            { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
          ],
          paymentData: {},
        },
      ]);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: {
          status: OrderStatus.PENDING,
          items: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          items: {
            include: {
              Raffle: true,
            },
          },
        },
      });
    });

    it('should return all orders with the given status if user is not provided', async () => {
      const orderStatus = OrderStatus.PENDING;
      const userId = undefined;

      const orders = [
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: new Date(),
          items: [
            { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
            { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
          ],
          details: {},
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(orders);

      const result = await service.findAllOrdersByStatusAndUser(
        orderStatus,
        userId,
      );

      expect(result).toEqual([
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: expect.any(Date),
          tickets: [
            { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
            { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
          ],
          paymentData: {},
        },
      ]);
      expect(prismaService.order.findMany).toHaveBeenCalled();
    });
  });
});
