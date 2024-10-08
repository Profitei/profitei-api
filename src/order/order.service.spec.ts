import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoService } from './mercado-pago.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from '../user/entities/user.entity';
import { OrderStatus } from '@prisma/client';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;
  let mercadoPagoService: MercadoPagoService;
  let amqpConnection: AmqpConnection;

  const mockPrismaService = {
    $transaction: jest.fn(),
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    ticket: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    raffle: {
      update: jest.fn(),
    },
  };

  const mockMercadoPagoService = {
    createPayment: jest.fn(),
  };

  const mockAmqpConnection = {
    publish: jest.fn(),
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
        {
          provide: AmqpConnection,
          useValue: mockAmqpConnection,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
    mercadoPagoService = module.get<MercadoPagoService>(MercadoPagoService);
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const createOrderDto: CreateOrderDto = { ticketsId: [1, 2] };
      const user: User = {
        id: 1,
        email: 'test@test.com',
        cpf: '12345678900',
      } as User;
      const tickets = [
        {
          id: 1,
          name: 'Yurih',
          status: 'AVAILABLE',
          Raffle: { price: 50, name: 'Raffle 1' },
        },
        {
          id: 2,
          name: 'Fallen',
          status: 'AVAILABLE',
          Raffle: { price: 100, name: 'Raffle 2' },
        },
      ];
      const paymentResult = { id: 'payment1' };

      mockPrismaService.ticket.findMany.mockResolvedValue(tickets);
      mockMercadoPagoService.createPayment.mockResolvedValue(paymentResult);
      mockPrismaService.$transaction.mockImplementation(async (cb) =>
        cb(prismaService),
      );
      mockPrismaService.order.create.mockResolvedValue({ id: 1 });
      mockPrismaService.order.findUniqueOrThrow.mockResolvedValue({
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
        description: 'Raffle 1 - Yurih, Raffle 2 - Fallen',
        payment_method_id: 'pix',
        email: user.email,
        identificationType: 'E-MAIL',
        number: user.email,
      });
      expect(prismaService.order.create).toHaveBeenCalled();
      expect(amqpConnection.publish).toHaveBeenCalledWith(
        'amq.direct',
        'order.created',
        1,
      );
    });

    it('should throw an error if tickets are not available', async () => {
      const createOrderDto: CreateOrderDto = { ticketsId: [1, 2] };
      const user: User = {
        id: 1,
        email: 'test@test.com',
        cpf: '12345678900',
      } as User;

      mockPrismaService.ticket.findMany.mockResolvedValue([
        { id: 1, status: 'AVAILABLE', Raffle: { price: 50, name: 'Raffle 1' } },
      ]);

      await expect(service.create(createOrderDto, user)).rejects.toThrow(
        'Some tickets are not available',
      );
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
        details: { id: 'payment_id' },
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
        paymentData: { id: 'payment_id' },
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

  describe('findByPaymentId', () => {
    it('should return a single order by payment id', async () => {
      const order = {
        id: 1,
        status: OrderStatus.PENDING,
        created: new Date(),
        items: [
          { id: 1, Raffle: { name: 'Raffle 1' } },
          { id: 2, Raffle: { name: 'Raffle 2' } },
        ],
        details: { id: 'payment_id' },
      };

      mockPrismaService.order.findFirst.mockResolvedValue(order);

      const result = await service.findByPaymentId('payment_id');
      expect(result).toEqual({
        id: 1,
        status: OrderStatus.PENDING,
        created: expect.any(Date),
        tickets: [
          { id: 1, Raffle: { name: 'Raffle 1' } },
          { id: 2, Raffle: { name: 'Raffle 2' } },
        ],
        paymentData: { id: 'payment_id' },
      });
    });
  });

  describe('findAllByUser', () => {
    it('should return all orders for a user', async () => {
      const user: User = {
        id: 1,
        email: 'test@test.com',
        cpf: '12345678901',
        image: 'pic.png',
        created: new Date(),
        name: 'Test User',
      };

      const orders = [
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: new Date(),
          items: [
            { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
            { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
          ],
          details: { id: 'payment_id' },
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(orders);

      const result = await service.findAllByUser(user);
      expect(result).toEqual([
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: expect.any(Date),
          tickets: [
            { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
            { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
          ],
          paymentData: { id: 'payment_id' },
        },
      ]);
    });
  });

  describe('findOneByUser', () => {
    it('should return a single order for a user', async () => {
      const user: User = {
        id: 1,
        email: 'test@test.com',
        cpf: '12345678901',
        image: 'pic.png',
        created: new Date(),
        name: 'Test User',
      };

      const order = {
        id: 1,
        status: OrderStatus.PENDING,
        created: new Date(),
        items: [
          { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
          { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
        ],
        details: { id: 'payment_id' },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(order);

      const result = await service.findOneByUser(1, user);
      expect(result).toEqual({
        id: 1,
        status: OrderStatus.PENDING,
        created: expect.any(Date),
        tickets: [
          { id: 1, Raffle: { name: 'Raffle 1', price: 50 } },
          { id: 2, Raffle: { name: 'Raffle 2', price: 100 } },
        ],
        paymentData: { id: 'payment_id' },
      });
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const updateOrderDto: UpdateOrderDto = { ticketsId: [1, 2] };
      mockPrismaService.order.update.mockResolvedValue({
        id: 1,
        ...updateOrderDto,
      });

      const result = service.update(1, updateOrderDto);
      expect(result).toEqual('This action updates a #1 order');
    });
  });

  describe('updateOrderStatus', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should update the order status to paid', async () => {
      mockPrismaService.order.update.mockResolvedValue({
        id: 1,
        status: OrderStatus.PAID,
      });

      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 1,
        items: [{ raffleId: 1 }],
      } as any);

      mockPrismaService.ticket.findMany.mockResolvedValue([]);
      mockPrismaService.raffle.update.mockResolvedValue(undefined);

      const result = await service.updateOrderStatus(1);
      expect(result).toBe(1);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: OrderStatus.PAID },
      });
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { items: { include: { Raffle: true } } },
      });
      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith({
        where: {
          raffleId: 1,
          OR: [
            { Order: null },
            { Order: { status: { not: OrderStatus.PAID } } },
          ],
        },
      });
      expect(mockPrismaService.raffle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'AWAITING_DRAW' },
      });
    });

    it('should not update raffle status if there are unpaid tickets', async () => {
      mockPrismaService.order.update.mockResolvedValue({
        id: 1,
        status: OrderStatus.PAID,
      });

      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 1,
        items: [{ raffleId: 1 }],
      } as any);

      mockPrismaService.ticket.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.updateOrderStatus(1);
      expect(result).toBe(1);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: OrderStatus.PAID },
      });
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { items: { include: { Raffle: true } } },
      });
      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith({
        where: {
          raffleId: 1,
          OR: [
            { Order: null },
            { Order: { status: { not: OrderStatus.PAID } } },
          ],
        },
      });
      expect(mockPrismaService.raffle.update).not.toHaveBeenCalled();
    });

    it('should throw an error if order update fails', async () => {
      mockPrismaService.order.update.mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(service.updateOrderStatus(1)).rejects.toThrow(
        'Update failed',
      );
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: OrderStatus.PAID },
      });
    });

    it('should throw an error if order not found', async () => {
      mockPrismaService.order.update.mockResolvedValue({
        id: 1,
        status: OrderStatus.PAID,
      });

      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.updateOrderStatus(1)).rejects.toThrow();
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: OrderStatus.PAID },
      });
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { items: { include: { Raffle: true } } },
      });
    });
  });

  describe('cancelPendingOrder', () => {
    it('should cancel a pending order', async () => {
      const pendingOrder =
        {
          id: 1,
          status: OrderStatus.PENDING,
          created: new Date(),
          items: [
            { id: 1, Raffle: { name: 'Raffle 1' } },
            { id: 2, Raffle: { name: 'Raffle 2' } },
          ],
          details: { id: 'payment_id' },
        };

      mockPrismaService.order.findUnique.mockResolvedValue(pendingOrder);
      mockPrismaService.$transaction.mockImplementation(async (cb) =>
        cb(prismaService),
      );
      mockPrismaService.order.update.mockResolvedValue({
        id: 1,
        status: OrderStatus.CANCELED,
      });

      await service.cancelPendingOrder(pendingOrder.id);
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { items: true },
      });
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: OrderStatus.CANCELED },
      });
    });
  });
});
