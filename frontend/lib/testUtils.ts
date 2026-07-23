import casual from 'casual';
import type { Item, User, CartItem, Order, OrderItem } from './types';

// seed it so we get consistent results
casual.seed(777);

export const fakeItem = (): Item => ({
  id: 'abc123',
  price: 5000,
  image: 'dog-small.jpg',
  title: 'dogs are best',
  description: 'dogs',
  largeImage: 'dog.jpg',
});

export const fakeUser = (): User => ({
  id: '4234',
  name: casual.name,
  email: casual.email,
  permissions: ['ADMIN'],
  cart: [],
});

export const fakeOrderItem = (): OrderItem => ({
  id: casual.uuid,
  image: `${casual.word}.jpg`,
  largeImage: `${casual.word}-large.jpg`,
  title: casual.words(3),
  price: 4234,
  quantity: 1,
  description: casual.words(5),
});

export const fakeOrder = (): Order => ({
  id: 'ord123',
  charge: 'ch_123',
  total: 40000,
  items: [fakeOrderItem(), fakeOrderItem()],
  createdAt: '2018-04-06T19:24:16.000Z',
  user: fakeUser(),
});

export const fakeCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'omg123',
  quantity: 3,
  item: fakeItem(),
  ...overrides,
});
