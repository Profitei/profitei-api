export class ResponseOrderDto {
  tickets: Tickets[];
  orderPrice: number;
  pixData: PixData;
  constructor(data: any) {
    this.tickets = data.tickets.map((ticket) => ({
      id: ticket.id,
      name: ticket.Raffle.name,
      Raffle: {
        price: ticket.Raffle.price,
      },
    }));
    this.orderPrice = this.calculateOrderPrice(data.tickets);
    this.pixData = {
      qrCode: data.paymentData.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64:
        data.paymentData.point_of_interaction.transaction_data.qr_code_base64,
    };
  }
  private calculateOrderPrice(tickets: Tickets[]): number {
    // Implementação da lógica de cálculo do preço total dos tickets
    return tickets.reduce((total, ticket) => {
      // Supondo que cada ticket tenha um preço que você deseja somar
      // Aqui você precisará ajustar de acordo com a estrutura real do seu objeto Ticket
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
}
export class PixData {
  qrCode: string;
  qrCodeBase64: string;
}
