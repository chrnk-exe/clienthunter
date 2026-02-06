import { Router } from "express";
import { addPayloadRecord, listPayloadRecords } from "../db/historyStore.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  res.json({ ok: true, items: listPayloadRecords("csrf") });
});

router.post("/", requireAuth, (req, res) => {
  const { payload, tag } = req.body ?? {};

  if (typeof payload !== "string" || payload.length === 0) {
    res.status(400).json({ ok: false, error: "payload is required" });
    return;
  }

  const record = addPayloadRecord({
    type: "csrf",
    payload,
    tag: typeof tag === "string" ? tag : null,
    userId: req.user?.nickname ?? null,
  });

  res.status(201).json({ ok: true, item: record });
});

export default router;
