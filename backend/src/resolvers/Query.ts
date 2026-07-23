import type { Prisma } from '@prisma/client';
import { hasPermission } from '../utils';
import type { Context } from '../types';

interface ItemWhereInput {
  OR?: ItemWhereInput[];
  title_contains?: string;
  description_contains?: string;
}

function buildItemWhere(where?: ItemWhereInput | null): Prisma.ItemWhereInput | undefined {
  if (!where) return undefined;
  if (where.OR) {
    return { OR: where.OR.map(buildItemWhere) as Prisma.ItemWhereInput[] };
  }
  const clause: Prisma.ItemWhereInput = {};
  if (where.title_contains) {
    clause.title = { contains: where.title_contains, mode: 'insensitive' };
  }
  if (where.description_contains) {
    clause.description = { contains: where.description_contains, mode: 'insensitive' };
  }
  return clause;
}

function mapItemOrderBy(orderBy?: string | null): Prisma.ItemOrderByWithRelationInput | undefined {
  if (!orderBy) return undefined;
  const [field, direction] = orderBy.split('_');
  return { [field]: direction.toLowerCase() } as Prisma.ItemOrderByWithRelationInput;
}

function mapOrderOrderBy(orderBy?: string | null): Prisma.OrderOrderByWithRelationInput {
  if (!orderBy) return { createdAt: 'desc' };
  const [field, direction] = orderBy.split('_');
  return { [field]: direction.toLowerCase() } as Prisma.OrderOrderByWithRelationInput;
}

const Query = {
  items(
    _parent: unknown,
    args: { where?: ItemWhereInput; orderBy?: string; skip?: number; first?: number },
    ctx: Context
  ) {
    return ctx.db.item.findMany({
      where: buildItemWhere(args.where),
      orderBy: mapItemOrderBy(args.orderBy),
      skip: args.skip,
      take: args.first,
    });
  },

  item(_parent: unknown, args: { where: { id: string } }, ctx: Context) {
    return ctx.db.item.findUnique({ where: { id: args.where.id } });
  },

  async itemsConnection(_parent: unknown, args: { where?: ItemWhereInput }, ctx: Context) {
    const count = await ctx.db.item.count({ where: buildItemWhere(args.where) });
    return { aggregate: { count } };
  },

  me(_parent: unknown, _args: unknown, ctx: Context) {
    if (!ctx.req.userId) return null;
    return ctx.db.user.findUnique({ where: { id: ctx.req.userId } });
  },

  async users(_parent: unknown, _args: unknown, ctx: Context) {
    if (!ctx.req.userId || !ctx.req.user) {
      throw new Error('You must be logged in!');
    }
    hasPermission(ctx.req.user, ['ADMIN', 'PERMISSIONUPDATE']);
    return ctx.db.user.findMany();
  },

  async order(_parent: unknown, args: { id: string }, ctx: Context) {
    if (!ctx.req.userId || !ctx.req.user) {
      throw new Error('You arent logged in');
    }
    const order = await ctx.db.order.findUnique({ where: { id: args.id } });
    if (!order) throw new Error('No order found');
    const ownsOrder = order.userId === ctx.req.userId;
    const hasPermissionToSeeOrder = ctx.req.user.permissions.includes('ADMIN');
    if (!ownsOrder && !hasPermissionToSeeOrder) {
      throw new Error('You cant see this budd');
    }
    return order;
  },

  async orders(_parent: unknown, args: { orderBy?: string }, ctx: Context) {
    const { userId } = ctx.req;
    if (!userId) {
      throw new Error('you must be signed in!');
    }
    return ctx.db.order.findMany({
      where: { userId },
      orderBy: mapOrderOrderBy(args.orderBy),
    });
  },
};

export default Query;
