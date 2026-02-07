import { query } from "./pool.js";

export async function recordCallback(input: {
  userId: string;
  type: "xss" | "csrf";
  path: string;
  method: string;
  ip: string | null;
  userAgent: string | null;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, unknown>;
  body: string | null;
}): Promise<void> {
  await query(
    `
      INSERT INTO callbacks (user_id, type, path, method, ip, user_agent, headers, query, body)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9)
    `,
    [
      input.userId,
      input.type,
      input.path,
      input.method,
      input.ip,
      input.userAgent,
      JSON.stringify(input.headers ?? {}),
      JSON.stringify(input.query ?? {}),
      input.body,
    ],
  );
}

export type CallbackRecord = {
  id: number;
  userId: string;
  type: "xss" | "csrf";
  path: string;
  method: string;
  ip: string | null;
  userAgent: string | null;
  headers: Record<string, unknown>;
  query: Record<string, unknown>;
  body: string | null;
  createdAt: string;
};

type CallbackRow = {
  id: number;
  user_id: string;
  type: "xss" | "csrf";
  path: string;
  method: string;
  ip: string | null;
  user_agent: string | null;
  headers: Record<string, unknown>;
  query: Record<string, unknown>;
  body: string | null;
  created_at: string;
};

function mapCallback(row: CallbackRow): CallbackRecord {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    path: row.path,
    method: row.method,
    ip: row.ip,
    userAgent: row.user_agent,
    headers: row.headers ?? {},
    query: row.query ?? {},
    body: row.body ?? null,
    createdAt: row.created_at,
  };
}

export async function getCallbacksByUser(
  userId: string,
  limit = 100,
): Promise<CallbackRecord[]> {
  const result = await query<CallbackRow>(
    `
      SELECT id, user_id, type, path, method, ip, user_agent, headers, query, body, created_at
      FROM callbacks
      WHERE user_id = $1
      ORDER BY id DESC
      LIMIT $2
    `,
    [userId, limit],
  );

  return result.rows.map(mapCallback);
}

export async function deleteCallbackById(userId: string, id: number): Promise<boolean> {
  const result = await query(
    "DELETE FROM callbacks WHERE user_id = $1 AND id = $2",
    [userId, id],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function clearCallbacks(userId: string): Promise<number> {
  const result = await query("DELETE FROM callbacks WHERE user_id = $1", [userId]);
  return result.rowCount ?? 0;
}

export async function getCallbackById(
  userId: string,
  id: number,
): Promise<CallbackRecord | null> {
  const result = await query<CallbackRow>(
    `
      SELECT id, user_id, type, path, method, ip, user_agent, headers, query, body, created_at
      FROM callbacks
      WHERE user_id = $1 AND id = $2
      LIMIT 1
    `,
    [userId, id],
  );
  const row = result.rows[0];
  return row ? mapCallback(row) : null;
}
