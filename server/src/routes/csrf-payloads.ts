import { Router } from "express";
import { createCsrfPayload, listCsrfPayloadsByUser } from "../db/csrfPayloads.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

/**
 * @openapi
 * /api/csrf-payloads:
 *   get:
 *     tags: [Payloads]
 *     summary: List CSRF payloads
 *     security:
 *       - ApiAuth: []
 *     responses:
 *       200:
 *         description: Payload list
 */
router.get("/", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }
  const items = await listCsrfPayloadsByUser(req.user.id);
  res.json({ ok: true, items });
});

/**
 * @openapi
 * /api/csrf-payloads:
 *   post:
 *     tags: [Payloads]
 *     summary: Create CSRF payload
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
router.post("/", requireAuth, async (req, res) => {
  const { payload, tag } = req.body ?? {};

  if (typeof payload !== "string" || payload.length === 0) {
    res.status(400).json({ ok: false, error: "payload is required" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const record = await createCsrfPayload({
    userId: req.user.id,
    payload,
    tag: typeof tag === "string" ? tag : null,
  });

  res.status(201).json({ ok: true, item: record });
});

export default router;
