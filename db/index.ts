import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

let poolConnection: mysql.Pool;

const databaseUrl = process.env.DATABASE_URL || "mysql://root:root@localhost:3306/coding_platform";

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: DATABASE_URL environment variable is not set. Using fallback for build. Do not do this in actual production runtime.');
}

try {
  // Use connection pool for Next.js 
  poolConnection = mysql.createPool({
    uri: databaseUrl,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  });
} catch (error) {
  console.error("Failed to connect to database:", error);
  throw error;
}

export const db = drizzle(poolConnection, { schema, mode: 'default' });
