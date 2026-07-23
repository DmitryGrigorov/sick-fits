import fs from 'fs';
import path from 'path';
import { ApolloServer } from '@apollo/server';
import resolvers from './resolvers';
import type { Context } from './types';

const typeDefs = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');

function createServer(): ApolloServer<Context> {
  return new ApolloServer<Context>({
    typeDefs,
    resolvers,
  });
}

export default createServer;
