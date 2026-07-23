import Query from './Query';
import Mutation from './Mutation';
import type { Context } from '../types';
import type { Item, CartItem, Order } from '@prisma/client';

const resolvers = {
  Query,
  Mutation,
  User: {
    cart(parent: { id: string }, _args: unknown, ctx: Context) {
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
    item(parent: CartItem, _args: unknown, ctx: Context) {
      if (!parent.itemId) return null;
      return ctx.db.item.findUnique({ where: { id: parent.itemId } });
    },
    user(parent: CartItem, _args: unknown, ctx: Context) {
      return ctx.db.user.findUnique({ where: { id: parent.userId } });
    },
  },
  Order: {
    items(parent: Order, _args: unknown, ctx: Context) {
      return ctx.db.orderItem.findMany({ where: { orderId: parent.id } });
    },
    user(parent: Order, _args: unknown, ctx: Context) {
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
