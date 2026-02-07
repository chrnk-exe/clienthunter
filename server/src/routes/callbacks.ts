import { Router } from "express";
import {
  clearCallbacks,
  deleteCallbackById,
  getCallbackById,
  getCallbacksByUser,
} from "../db/callbacks.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }
  const items = await getCallbacksByUser(req.user.id, 200);
  res.json({ ok: true, items });
});

router.delete("/", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }
  const deleted = await clearCallbacks(req.user.id);
  res.json({ ok: true, deleted });
});

router.delete("/:id", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ ok: false, error: "invalid id" });
    return;
  }
  const ok = await deleteCallbackById(req.user.id, id);
  res.json({ ok });
});

router.get("/:id", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ ok: false, error: "invalid id" });
    return;
  }
  const item = await getCallbackById(req.user.id, id);
  if (!item) {
    res.status(404).json({ ok: false, error: "not found" });
    return;
  }
  res.json({ ok: true, item });
});

export default router;
