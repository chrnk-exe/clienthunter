import type { Request, Response, NextFunction } from "express";
import { verifyUser } from "../db/userStore.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const nickname = req.header("x-nickname");
  const token = req.header("x-token");

  if (!nickname || !token) {
    res.status(401).json({ ok: false, error: "missing auth headers" });
    return;
  }

  const user = verifyUser(nickname, token);
  if (!user) {
    res.status(401).json({ ok: false, error: "invalid auth" });
    return;
  }

  req.user = user;
  next();
}
