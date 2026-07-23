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
  const app = express();
  const server = createServer();
  await server.start();

  app.use(
    cors({
      credentials: true,
      origin: process.env.FRONTEND_URL,
    })
  );
  app.use(cookieParser());

  // decode the JWT so we can get the user id on each request
  app.use((req, _res, next) => {
    const { token } = req.cookies;
    if (token) {
      try {
        const { userId } = jwt.verify(token, process.env.APP_SECRET as string) as { userId: string };
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
  app.listen(port, () => {
    console.log(`Server is now running on port http://localhost:${port}`);
  });
}

start();
