import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { expressMiddleware } from '@as-integrations/express5';

import createServer from './createServer';
import db from './db';
import type { AuthedUser } from './types';

async function start(): Promise<void> {
  const appSecret = process.env.APP_SECRET;
  if (!appSecret) {
    throw new Error('APP_SECRET environment variable is required');
  }

  const app = express();
  const server = createServer();
  await server.start();
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:7777')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
    })
  );
  app.use(cookieParser());

  app.get('/healthz', async (_req, res, next) => {
    try {
      await db.$queryRaw`SELECT 1`;
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      next(error);
    }
  });

  // decode the JWT so we can get the user id on each request
  app.use((req, _res, next) => {
    const { token } = req.cookies;
    if (token) {
      try {
        const { userId } = jwt.verify(token, appSecret) as { userId: string };
        req.userId = userId;
      } catch (err) {
        // invalid/expired token — treat as logged out
      }
    }
    next();
  });

  // populate the user on each request
  app.use(async (req, _res, next) => {
    if (!req.userId) return next();
    req.user = (await db.user.findUnique({
      where: { id: req.userId },
      select: { id: true, permissions: true, email: true, name: true },
    })) as AuthedUser | null;
    next();
  });

  app.use(
    '/',
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res, db }),
    })
  );

  const port = Number(process.env.PORT) || 4444;
  const httpServer = app.listen(port, () => {
    console.log(`Server is now running on port http://localhost:${port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down`);
    httpServer.close(async () => {
      await server.stop();
      await db.$disconnect();
      process.exit(0);
    });
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
}

start().catch(async error => {
  console.error('Failed to start server:', error);
  await db.$disconnect();
  process.exit(1);
});
