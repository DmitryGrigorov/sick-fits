import Query from './Query';
import Mutation from './Mutation';
import type { Context } from '../types';
import type { Item, CartItem, Order } from '@prisma/client';

const resolvers = {
  Query,
  Mutation,
  User: {
    cart(parent: { id: string; cart?: unknown[] }, _args: unknown, ctx: Context) {
      if (parent.cart) return parent.cart;
      return ctx.db.cartItem.findMany({ where: { userId: parent.id } });
    },
  },
  Item: {
    user(parent: Item, _args: unknown, ctx: Context) {
      if (!parent.userId) return null;
      return ctx.db.user.findUnique({ where: { id: parent.userId } });
    },
  },
  CartItem: {
    item(parent: CartItem & { item?: unknown }, _args: unknown, ctx: Context) {
      if (parent.item !== undefined) return parent.item;
      if (!parent.itemId) return null;
      return ctx.db.item.findUnique({ where: { id: parent.itemId } });
    },
    user(parent: CartItem, _args: unknown, ctx: Context) {
      return ctx.db.user.findUnique({ where: { id: parent.userId } });
    },
  },
  Order: {
    items(parent: Order & { items?: unknown[] }, _args: unknown, ctx: Context) {
      if (parent.items) return parent.items;
      return ctx.db.orderItem.findMany({ where: { orderId: parent.id } });
    },
    user(parent: Order & { user?: unknown }, _args: unknown, ctx: Context) {
      if (parent.user) return parent.user;
      return ctx.db.user.findUnique({ where: { id: parent.userId } });
    },
    createdAt(parent: Order) {
      return parent.createdAt.toISOString();
    },
    updatedAt(parent: Order) {
      return parent.updatedAt.toISOString();
    },
  },
};

export default resolvers;
