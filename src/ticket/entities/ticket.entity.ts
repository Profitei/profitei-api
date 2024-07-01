export class Ticket {
  id: number;
  name: string;
  Raffle?: {
    id: number;
    name: string;
    price: number;
    status: string;
  } | null;
}
