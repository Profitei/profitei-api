export class ResponseOrderDto {
  id: number;
  tickets: Tickets[];
  orderPrice: number;
  pixData: PixData;

  constructor(data: any) {
    this.id = data.id;
    this.tickets = data.tickets.map(
      (ticket: { id: any; raffle: { name: any; price: any } }) => ({
        id: ticket.id,
        name: ticket.raffle.name,
        Raffle: {
          price: ticket.raffle.price,
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
      return total + (ticket.raffle.price ?? 0);
    }, 0);
  }
}

export class Tickets {
  id: number;
  name: string;
  raffle: Raffle;
}

export class Raffle {
  price: number;
}
export class PixData {
  qrCode: string;
  qrCodeBase64: string;
}
