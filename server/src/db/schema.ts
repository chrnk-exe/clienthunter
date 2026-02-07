import { query } from "./pool.js";

export async function ensureSchema(): Promise<void> {
  await query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      nickname text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      token text NOT NULL,
      xss_path text UNIQUE NOT NULL,
      csrf_path text UNIQUE NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS callbacks (
      id bigserial PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type text NOT NULL,
      path text NOT NULL,
      method text NOT NULL,
      ip text,
      user_agent text,
      headers jsonb,
      query jsonb,
      body text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS csrf_payloads (
      id bigserial PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      payload text NOT NULL,
      tag text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS xss_payloads (
      id bigserial PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      payload text NOT NULL,
      tag text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}
