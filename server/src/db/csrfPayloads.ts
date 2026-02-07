import { query } from "./pool.js";

export type CsrfPayloadRecord = {
  id: number;
  userId: string;
  payload: string;
  tag: string | null;
  createdAt: string;
};

type CsrfPayloadRow = {
  id: number;
  user_id: string;
  payload: string;
  tag: string | null;
  created_at: string;
};

function mapRow(row: CsrfPayloadRow): CsrfPayloadRecord {
  return {
    id: row.id,
    userId: row.user_id,
    payload: row.payload,
    tag: row.tag,
    createdAt: row.created_at,
  };
}

export async function createCsrfPayload(input: {
  userId: string;
  payload: string;
  tag?: string | null;
}): Promise<CsrfPayloadRecord> {
  const result = await query<CsrfPayloadRow>(
    `
      INSERT INTO csrf_payloads (user_id, payload, tag)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, payload, tag, created_at
    `,
    [input.userId, input.payload, input.tag ?? null],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to create CSRF payload");
  }
  return mapRow(row);
}

export async function listCsrfPayloadsByUser(
  userId: string,
  limit = 50,
): Promise<CsrfPayloadRecord[]> {
  const result = await query<CsrfPayloadRow>(
    `
      SELECT id, user_id, payload, tag, created_at
      FROM csrf_payloads
      WHERE user_id = $1
      ORDER BY id DESC
      LIMIT $2
    `,
    [userId, limit],
  );
  return result.rows.map(mapRow);
}

export async function getLatestCsrfPayloadByUser(
  userId: string,
): Promise<CsrfPayloadRecord | null> {
  const result = await query<CsrfPayloadRow>(
    `
      SELECT id, user_id, payload, tag, created_at
      FROM csrf_payloads
      WHERE user_id = $1
      ORDER BY id DESC
      LIMIT 1
    `,
    [userId],
  );
  const row = result.rows[0];
  return row ? mapRow(row) : null;
}
