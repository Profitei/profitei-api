import { Ticket } from '../../ticket/entities/ticket.entity';

export class Order {
  id: number;
  status: string;
  tickets: Ticket[];
  paymentData: any;
  created: Date;
}
