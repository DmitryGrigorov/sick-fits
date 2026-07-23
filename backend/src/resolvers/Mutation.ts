import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import type { Permission } from '@prisma/client';
import { transport, makeANiceEmail } from '../mail';
import { hasPermission } from '../utils';
import stripe from '../stripe';
import type { Context } from '../types';

const ONE_YEAR_COOKIE = 1000 * 60 * 60 * 24 * 365;

function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.APP_SECRET as string);
}

function setTokenCookie(ctx: Context, token: string): void {
  ctx.res.cookie('token', token, {
    httpOnly: true,
    maxAge: ONE_YEAR_COOKIE,
  });
}

const Mutations = {
  async createItem(
    _parent: unknown,
    args: { title: string; description: string; price: number; image?: string; largeImage?: string },
    ctx: Context
  ) {
    if (!ctx.req.userId) {
      throw new Error('You must be logged in to do that');
    }
    return ctx.db.item.create({
      data: {
        title: args.title,
        description: args.description,
        price: args.price,
        image: args.image,
        largeImage: args.largeImage,
        user: { connect: { id: ctx.req.userId } },
      },
    });
  },

  updateItem(
    _parent: unknown,
    args: { id: string; title?: string; description?: string; price?: number },
    ctx: Context
  ) {
    const updates = { ...args } as Partial<typeof args>;
    delete updates.id;
    return ctx.db.item.update({
      data: updates,
      where: { id: args.id },
    });
  },

  async deleteItem(_parent: unknown, args: { id: string }, ctx: Context) {
    const where = { id: args.id };
    const item = await ctx.db.item.findUnique({ where });
    if (!item) throw new Error('Item not found');
    const ownsItem = item.userId === ctx.req.userId;
    const hasDeletePermission =
      ctx.req.user && ctx.req.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission));
    if (!ownsItem && !hasDeletePermission) {
      throw new Error("You don't have permission to do this");
    }
    return ctx.db.item.delete({ where });
  },

  async signup(_parent: unknown, args: { email: string; password: string; name: string }, ctx: Context) {
    const email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.user.create({
      data: {
        name: args.name,
        email,
        password,
        permissions: ['USER'],
      },
    });
    setTokenCookie(ctx, signToken(user.id));
    return user;
  },

  async signin(_parent: unknown, args: { email: string; password: string }, ctx: Context) {
    const { email, password } = args;
    const user = await ctx.db.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email: ${email}`);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }
    setTokenCookie(ctx, signToken(user.id));
    return user;
  },

  signout(_parent: unknown, _args: unknown, ctx: Context) {
    ctx.res.clearCookie('token');
    return { message: 'Goodbye!' };
  },

  async requestReset(_parent: unknown, args: { email: string }, ctx: Context) {
    const user = await ctx.db.user.findUnique({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email: ${args.email}`);
    }
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = String(Date.now() + 3600000); // 1 hour from now
    await ctx.db.user.update({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    await transport.sendMail({
      from: 'noreply@sickfits.dev',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your password reset token is here!\n\n
        <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to Reset</a>
      `),
    });
    return { message: 'Thanks!' };
  },

  async resetPassword(
    _parent: unknown,
    args: { resetToken: string; password: string; confirmPassword: string },
    ctx: Context
  ) {
    if (args.password !== args.confirmPassword) {
      throw new Error("Yo Passwords don't match");
    }
    const user = await ctx.db.user.findFirst({ where: { resetToken: args.resetToken } });
    if (!user || !user.resetTokenExpiry || Number(user.resetTokenExpiry) < Date.now() - 3600000) {
      throw new Error('This token is either invalid or expired!');
    }
    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.user.update({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    setTokenCookie(ctx, signToken(updatedUser.id));
    return updatedUser;
  },

  async updatePermissions(
    _parent: unknown,
    args: { permissions: Permission[]; userId: string },
    ctx: Context
  ) {
    if (!ctx.req.userId || !ctx.req.user) {
      throw new Error('You must be logged in!');
    }
    hasPermission(ctx.req.user, ['ADMIN', 'PERMISSIONUPDATE']);
    return ctx.db.user.update({
      data: { permissions: { set: args.permissions } },
      where: { id: args.userId },
    });
  },

  async addToCart(_parent: unknown, args: { id: string }, ctx: Context) {
    const { userId } = ctx.req;
    if (!userId) throw new Error('You must be signed in soon');
    const existingCartItem = await ctx.db.cartItem.findFirst({
      where: { userId, itemId: args.id },
    });
    if (existingCartItem) {
      return ctx.db.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      });
    }
    return ctx.db.cartItem.create({
      data: {
        user: { connect: { id: userId } },
        item: { connect: { id: args.id } },
      },
    });
  },

  async removeFromCart(_parent: unknown, args: { id: string }, ctx: Context) {
    const cartItem = await ctx.db.cartItem.findUnique({ where: { id: args.id } });
    if (!cartItem) throw new Error('No CartItem Found!');
    if (cartItem.userId !== ctx.req.userId) {
      throw new Error('Cheating huhhh');
    }
    return ctx.db.cartItem.delete({ where: { id: args.id } });
  },

  async createOrder(_parent: unknown, args: { token: string }, ctx: Context) {
    const { userId } = ctx.req;
    if (!userId) throw new Error('You must be signed in to complete this order');
    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      include: { cart: { include: { item: true } } },
    });
    if (!user) throw new Error('No such user found');
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + (cartItem.item ? cartItem.item.price * cartItem.quantity : 0),
      0
    );
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });
    const orderItems = user.cart
      .filter(cartItem => cartItem.item)
      .map(cartItem => ({
        title: cartItem.item!.title,
        description: cartItem.item!.description,
        image: cartItem.item!.image || '',
        largeImage: cartItem.item!.largeImage || '',
        price: cartItem.item!.price,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } },
      }));
    const order = await ctx.db.order.create({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } },
      },
    });
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.cartItem.deleteMany({ where: { id: { in: cartItemIds } } });
    return order;
  },
};

export default Mutations;
