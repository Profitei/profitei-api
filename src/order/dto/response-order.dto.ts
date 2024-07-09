export class ResponseOrderDto {
  id: number;
  status: string;
  created: Date;
  tickets: Tickets[];
  orderPrice: number;
  pixData: PixData;

  constructor(data: any) {
    this.id = data.id;
    this.status = data.status;
    this.created = data.created;
    this.tickets = data.tickets.map(
      (ticket: {
        id: number;
        name: string;
        Raffle: Raffle;
      }) => ({
        id: ticket.id,
        name: ticket.name,
        raffle: {
          price: ticket.Raffle.price,
          name: ticket.Raffle.name,
          status: ticket.Raffle.status

        },
      }),
    );
    this.orderPrice = this.calculateOrderPrice(data.tickets);
    this.pixData = {
      qrCode: data.paymentData.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64:
        data.paymentData.point_of_interaction.transaction_data.qr_code_base64,
    };
  }

  private calculateOrderPrice(tickets: Tickets[]): number {
    return tickets.reduce((total, ticket) => {
      return total + (ticket.Raffle.price ?? 0);
    }, 0);
  }
}

export class Tickets {
  id: number;
  name: string;
  Raffle: Raffle;
}

export class Raffle {
  price: number;
  name: string;
  status: string;
}
export class PixData {
  qrCode: string;
  qrCodeBase64: string;
}
