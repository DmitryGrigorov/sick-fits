export type Permission =
  | 'ADMIN'
  | 'USER'
  | 'ITEMCREATE'
  | 'ITEMUPDATE'
  | 'ITEMDELETE'
  | 'PERMISSIONUPDATE';

export interface Item {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  largeImage?: string | null;
  price: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  item: Item | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  permissions: Permission[];
  cart: CartItem[];
}

export interface OrderItem {
  id: string;
  title: string;
  description: string;
  image: string;
  largeImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  charge: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string };
}
