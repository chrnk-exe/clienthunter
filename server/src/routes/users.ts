import { Router } from "express";
import { createUser, getUserByNickname, verifyUser } from "../db/userStore.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

router.post("/register", (req, res) => {
  const { nickname } = req.body ?? {};
  if (typeof nickname !== "string" || nickname.trim().length < 3) {
    res.status(400).json({ ok: false, error: "nickname must be at least 3 chars" });
    return;
  }

  if (getUserByNickname(nickname)) {
    res.status(409).json({ ok: false, error: "nickname already taken" });
    return;
  }

  const user = createUser(nickname);
  res.status(201).json({ ok: true, user });
});

router.post("/login", (req, res) => {
  const { nickname, token } = req.body ?? {};
  if (typeof nickname !== "string" || typeof token !== "string") {
    res.status(400).json({ ok: false, error: "nickname and token are required" });
    return;
  }

  const user = verifyUser(nickname, token);
  if (!user) {
    res.status(401).json({ ok: false, error: "invalid credentials" });
    return;
  }

  res.json({ ok: true, user });
});

export default router;
