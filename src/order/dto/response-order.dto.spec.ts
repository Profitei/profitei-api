import { ResponseOrderDto } from './response-order.dto';
// import { Tickets } from './response-order.dto';
// import { Raffle } from './response-order.dto';
// import { PixData } from './response-order.dto';

describe('ResponseOrderDto', () => {
  let data: any;

  beforeEach(() => {
    data = {
      id: 1,
      status: 'pending',
      created: new Date('2023-01-01'),
      tickets: [
        {
          id: 101,
          name: 'Ticket 1',
          Raffle: {
            name: 'Raffle 1',
            price: 50,
          },
        },
        {
          id: 102,
          name: 'Ticket 2',
          Raffle: {
            name: 'Raffle 2',
            price: 100,
          },
        },
      ],
      paymentData: {
        point_of_interaction: {
          transaction_data: {
            qr_code: 'someQrCode',
            qr_code_base64: 'someQrCodeBase64',
          },
        },
      },
    };
  });

  it('should create an instance of ResponseOrderDto', () => {
    const dto = new ResponseOrderDto(data);
    expect(dto).toBeInstanceOf(ResponseOrderDto);
  });

  it('should set the id property correctly', () => {
    const dto = new ResponseOrderDto(data);
    expect(dto.id).toEqual(data.id);
  });

  it('should set the status property correctly', () => {
    const dto = new ResponseOrderDto(data);
    expect(dto.status).toEqual(data.status);
  });

  it('should set the created property correctly', () => {
    const dto = new ResponseOrderDto(data);
    expect(dto.created).toEqual(data.created);
  });

  it('should set the tickets property correctly', () => {
    const dto = new ResponseOrderDto(data);
    expect(dto.tickets).toEqual(
      data.tickets.map((ticket: any) => ({
        id: ticket.id,
        name: ticket.name,
        raffle: {
          price: ticket.Raffle.price,
          name: ticket.Raffle.name,
        },
      })),
    );
  });

  it('should calculate the orderPrice property correctly', () => {
    const dto = new ResponseOrderDto(data);
    expect(dto.orderPrice).toEqual(150);
  });

  it('should set the pixData property correctly', () => {
    const dto = new ResponseOrderDto(data);
    expect(dto.pixData).toEqual({
      qrCode: data.paymentData.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64:
        data.paymentData.point_of_interaction.transaction_data.qr_code_base64,
    });
  });
});
