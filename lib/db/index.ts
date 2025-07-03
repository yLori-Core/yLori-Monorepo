import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the database instance directly with the connection string
export const db = drizzle(process.env.DATABASE_URL, { schema });

export * from './schema'; 