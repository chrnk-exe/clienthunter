import { Router } from "express";
import { addPayloadRecord, listPayloadRecords } from "../db/historyStore.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

/**
 * @openapi
 * /api/xss-payloads:
 *   get:
 *     tags: [Payloads]
 *     summary: List XSS payloads
 *     security:
 *       - ApiAuth: []
 *     responses:
 *       200:
 *         description: Payload list
 */
router.get("/", requireAuth, (req, res) => {
  res.json({ ok: true, items: listPayloadRecords("xss") });
});

/**
 * @openapi
 * /api/xss-payloads:
 *   post:
 *     tags: [Payloads]
 *     summary: Create XSS payload
 *     security:
 *       - ApiAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [payload]
 *             properties:
 *               payload:
 *                 type: string
 *               tag:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created payload
 */
router.post("/", requireAuth, (req, res) => {
  const { payload, tag } = req.body ?? {};

  if (typeof payload !== "string" || payload.length === 0) {
    res.status(400).json({ ok: false, error: "payload is required" });
    return;
  }

  const record = addPayloadRecord({
    type: "xss",
    payload,
    tag: typeof tag === "string" ? tag : null,
    userId: req.user?.nickname ?? null,
  });

  res.status(201).json({ ok: true, item: record });
});

export default router;
