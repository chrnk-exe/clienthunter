import type { Request, Response, NextFunction } from "express";
import { getUserById } from "../db/users.js";
import { verifyAuthToken } from "../utils/jwt.js";

function readAuthToken(req: Request): string | null {
  const header = req.header("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  const cookieToken = req.cookies?.auth;
  return typeof cookieToken === "string" ? cookieToken : null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = readAuthToken(req);
  if (!token) {
    res.status(401).json({ ok: false, error: "missing auth token" });
    return;
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await getUserById(payload.sub);
    if (!user) {
      res.status(401).json({ ok: false, error: "invalid auth" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ ok: false, error: "invalid auth" });
  }
}
