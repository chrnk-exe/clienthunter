import { query } from "./pool.js";
import { comparePassword, hashPassword } from "../utils/passwords.js";

export type User = {
  id: string;
  nickname: string;
  xssPath: string;
  csrfPath: string;
  createdAt: string;
};

type UserRow = {
  id: string;
  nickname: string;
  xss_path: string;
  csrf_path: string;
  created_at: string;
};

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    nickname: row.nickname,
    xssPath: row.xss_path,
    csrfPath: row.csrf_path,
    createdAt: row.created_at,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query<UserRow>(
    "SELECT id, nickname, xss_path, csrf_path, created_at FROM users WHERE id = $1",
    [id],
  );
  const row = result.rows[0];
  return row ? mapUser(row) : null;
}

export async function getUserByNickname(nickname: string): Promise<User | null> {
  const result = await query<UserRow>(
    "SELECT id, nickname, xss_path, csrf_path, created_at FROM users WHERE nickname = $1",
    [nickname],
  );
  const row = result.rows[0];
  return row ? mapUser(row) : null;
}

export async function createUser(nickname: string, password: string): Promise<User> {
  const passwordHash = await hashPassword(password);
  const xssPath = `/${nickname}/xss`;
  const csrfPath = `/${nickname}.html`;
  const token = crypto.randomUUID();

  const result = await query<UserRow>(
    `
      INSERT INTO users (nickname, password_hash, token, xss_path, csrf_path)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nickname, xss_path, csrf_path, created_at
    `,
    [nickname, passwordHash, token, xssPath, csrfPath],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to create user");
  }
  return mapUser(row);
}

export async function verifyUserPassword(
  nickname: string,
  password: string,
): Promise<User | null> {
  const result = await query<
    UserRow & {
      password_hash: string;
    }
  >(
    `
      SELECT id, nickname, xss_path, csrf_path, created_at, password_hash
      FROM users
      WHERE nickname = $1
    `,
    [nickname],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const ok = await comparePassword(password, row.password_hash);
  return ok ? mapUser(row) : null;
}

export async function updateUser(
  nickname: string,
  updates: {
    password?: string;
    xssPath?: string;
    csrfPath?: string;
    token?: string;
  },
): Promise<User | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (updates.password) {
    fields.push(`password_hash = $${idx++}`);
    values.push(await hashPassword(updates.password));
  }
  if (updates.xssPath) {
    fields.push(`xss_path = $${idx++}`);
    values.push(updates.xssPath);
  }
  if (updates.csrfPath) {
    fields.push(`csrf_path = $${idx++}`);
    values.push(updates.csrfPath);
  }
  if (updates.token) {
    fields.push(`token = $${idx++}`);
    values.push(updates.token);
  }

  if (fields.length === 0) {
    return getUserByNickname(nickname);
  }

  values.push(nickname);
  const result = await query<UserRow>(
    `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE nickname = $${idx}
      RETURNING id, nickname, xss_path, csrf_path, created_at
    `,
    values,
  );

  const row = result.rows[0];
  return row ? mapUser(row) : null;
}

export async function deleteUser(nickname: string): Promise<boolean> {
  const result = await query("DELETE FROM users WHERE nickname = $1", [nickname]);
  return (result.rowCount ?? 0) > 0;
}

export async function getRouteOwner(path: string): Promise<{
  user: User;
  type: "xss" | "csrf";
} | null> {
  const result = await query<
    UserRow & {
      route_type: "xss" | "csrf";
    }
  >(
    `
      SELECT id, nickname, xss_path, csrf_path, created_at, 'xss'::text AS route_type
      FROM users
      WHERE xss_path = $1
      UNION ALL
      SELECT id, nickname, xss_path, csrf_path, created_at, 'csrf'::text AS route_type
      FROM users
      WHERE csrf_path = $1
      LIMIT 1
    `,
    [path],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    user: mapUser(row),
    type: row.route_type,
  };
}
