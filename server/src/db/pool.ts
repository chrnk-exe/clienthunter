import type { QueryResultRow } from "pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? { connectionString }
    : {
        host: process.env.PG_HOST,
        port: process.env.PG_PORT ? Number(process.env.PG_PORT) : undefined,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DB,
      },
);

export async function query<T extends QueryResultRow>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params);
}
