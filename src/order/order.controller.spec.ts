import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseOrderDto } from './dto/response-order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    create: jest.fn().mockImplementation(() => ({
      id: 1,
      status: 'pending',
      created: new Date(),
      tickets: [
        { id: 1, name: 'Ticket 1', Raffle: { name: 'Raffle 1', price: 50 } },
        { id: 2, name: 'Ticket 2', Raffle: { name: 'Raffle 2', price: 100 } },
      ],
      orderPrice: 150,
      paymentData: {
        point_of_interaction: {
          transaction_data: {
            qr_code: 'someQrCode',
            qr_code_base64: 'someQrCodeBase64',
          },
        },
      },
    })),
    findAll: jest.fn().mockResolvedValue([
      {
        id: 1,
        status: 'pending',
        created: new Date(),
        tickets: [
          { id: 1, name: 'Ticket 1', Raffle: { name: 'Raffle 1', price: 50 } },
          { id: 2, name: 'Ticket 2', Raffle: { name: 'Raffle 2', price: 100 } },
        ],
        orderPrice: 150,
        paymentData: {
          point_of_interaction: {
            transaction_data: {
              qr_code: 'someQrCode',
              qr_code_base64: 'someQrCodeBase64',
            },
          },
        },
      },
    ]),
    findOne: jest.fn().mockImplementation((id: number) => ({
      id,
      status: 'pending',
      created: new Date(),
      tickets: [
        { id: 1, name: 'Ticket 1', Raffle: { name: 'Raffle 1', price: 50 } },
        { id: 2, name: 'Ticket 2', Raffle: { name: 'Raffle 2', price: 100 } },
      ],
      orderPrice: 150,
      paymentData: {
        point_of_interaction: {
          transaction_data: {
            qr_code: 'someQrCode',
            qr_code_base64: 'someQrCodeBase64',
          },
        },
      },
    })),
    update: jest.fn().mockImplementation((id: number, dto) => ({
      id,
      ...dto,
    })),
    remove: jest.fn().mockImplementation((id: number) => ({ id })),
    findAllOrdersByStatusAndUser: jest.fn().mockResolvedValue([
      {
        id: 1,
        status: 'pending',
        created: new Date(),
        tickets: [
          { id: 1, name: 'Ticket 1', Raffle: { name: 'Raffle 1', price: 50 } },
          { id: 2, name: 'Ticket 2', Raffle: { name: 'Raffle 2', price: 100 } },
        ],
        orderPrice: 150,
        paymentData: {
          point_of_interaction: {
            transaction_data: {
              qr_code: 'someQrCode',
              qr_code_base64: 'someQrCodeBase64',
            },
          },
        },
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const dto: CreateOrderDto = { ticketsId: [1, 2] };
      const req = { user: { id: 1, email: 'test@test.com' } };
      const result = await controller.create(req, dto);
      expect(result).toEqual(
        new ResponseOrderDto({
          id: 1,
          status: 'pending',
          created: expect.any(Date),
          tickets: [
            {
              id: 1,
              name: 'Ticket 1',
              Raffle: { name: 'Raffle 1', price: 50 },
            },
            {
              id: 2,
              name: 'Ticket 2',
              Raffle: { name: 'Raffle 2', price: 100 },
            },
          ],
          orderPrice: 150,
          paymentData: {
            point_of_interaction: {
              transaction_data: {
                qr_code: 'someQrCode',
                qr_code_base64: 'someQrCodeBase64',
              },
            },
          },
        }),
      );
      expect(service.create).toHaveBeenCalledWith(dto, req.user);
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([
        new ResponseOrderDto({
          id: 1,
          status: 'pending',
          created: expect.any(Date),
          tickets: [
            {
              id: 1,
              name: 'Ticket 1',
              Raffle: { name: 'Raffle 1', price: 50 },
            },
            {
              id: 2,
              name: 'Ticket 2',
              Raffle: { name: 'Raffle 2', price: 100 },
            },
          ],
          orderPrice: 150,
          paymentData: {
            point_of_interaction: {
              transaction_data: {
                qr_code: 'someQrCode',
                qr_code_base64: 'someQrCodeBase64',
              },
            },
          },
        }),
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(
        new ResponseOrderDto({
          id: 1,
          status: 'pending',
          created: expect.any(Date),
          tickets: [
            {
              id: 1,
              name: 'Ticket 1',
              Raffle: { name: 'Raffle 1', price: 50 },
            },
            {
              id: 2,
              name: 'Ticket 2',
              Raffle: { name: 'Raffle 2', price: 100 },
            },
          ],
          orderPrice: 150,
          paymentData: {
            point_of_interaction: {
              transaction_data: {
                qr_code: 'someQrCode',
                qr_code_base64: 'someQrCodeBase64',
              },
            },
          },
        }),
      );
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const dto: UpdateOrderDto = { ticketsId: [1, 2] };
      const result = await controller.update('1', dto);
      expect(result).toEqual({ id: 1, ...dto });
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove an order', async () => {
      const result = await controller.remove('1');
      expect(result).toEqual({ id: 1 });
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
