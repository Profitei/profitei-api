import { RaffleStatus } from './raffle.service';

export const mockCreateRaffle = () => ({
  name: 'Raffle Test',
  image: 'none',
  price: 5,
  quantity: 5,
  properties: [
    { name: 'Property 1', value: 'Value 1' },
    { name: 'Property 2', value: 'Value 2' },
  ],
});

export const mockExpectedCreateRaffle = () => ({
  name: 'Raffle Test',
  image: 'none',
  price: 5,
  Tickets: [
    {
      id: 1,
      number: 1,
      raffleId: 1,
    },
    {
      id: 2,
      number: 2,
      raffleId: 1,
    },
    {
      id: 3,
      number: 3,
      raffleId: 1,
    },
    {
      id: 4,
      number: 4,
      raffleId: 1,
    },
    {
      id: 5,
      number: 5,
      raffleId: 1,
    },
  ],
  properties: [
    {
      id: 1,
      name: 'Property 1',
      value: 'Value 1',
      raffleId: 1,
    },
  ],
  categoryId: 1,
  status: RaffleStatus.AVAILABLE,
  id: 1,
  categotyId: 1,
  created: new Date(),
  modified: new Date(),
});

export const mockExpectedFindAllRaffle = () => [
  {
    name: 'Raffle Test',
    image: 'none',
    price: 5,
    Tickets: [
      {
        id: 1,
        number: 1,
        raffleId: 1,
      },
      {
        id: 2,
        number: 2,
        raffleId: 1,
      },
      {
        id: 3,
        number: 3,
        raffleId: 1,
      },
      {
        id: 4,
        number: 4,
        raffleId: 1,
      },
      {
        id: 5,
        number: 5,
        raffleId: 1,
      },
    ],
    properties: [
      {
        id: 1,
        name: 'Property 1',
        value: 'Value 1',
        raffleId: 1,
      },
    ],
    categoryId: 1,
    status: RaffleStatus.AVAILABLE,
    id: 1,
    categotyId: 1,
    created: new Date(),
    modified: new Date(),
  },
];

export const mockCalledWith = () => ({
  name: 'Raffle Test',
  image: 'none',
  price: 5,
  category: {
    create: {
      name: undefined,
    },
  },
  properties: {
    createMany: {
      data: [
        { name: 'name', value: 'Property 1' },
        { name: 'name', value: 'Property 2' },
      ],
    },
  },
  status: RaffleStatus.AVAILABLE,
  tickets: {
    createMany: {
      data: [
        { name: 's1mple', winner: false },
        { name: 'ZywOo', winner: false },
        { name: 'device', winner: false },
        { name: 'NiKo', winner: false },
        { name: 'electronic', winner: false },
      ],
    },
  },
});
