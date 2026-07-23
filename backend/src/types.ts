import type { Request, Response } from 'express';
import type { PrismaClient, Permission } from '@prisma/client';

export interface AuthedUser {
  id: string;
  name: string;
  email: string;
  permissions: Permission[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      user?: AuthedUser | null;
    }
  }
}

export interface Context {
  req: Request;
  res: Response;
  db: PrismaClient;
}
