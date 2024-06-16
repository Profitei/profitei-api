import { Ticket } from '../../ticket/entities/ticket.entity';

export class Order {
  id: number;
  status: string;
  created: Date;
  tickets: Ticket[];
  paymentData: any; // Tipo genérico para os dados de pagamento, você pode ajustar conforme necessário
}
