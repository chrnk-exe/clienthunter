import { Router, type Request } from "express";
import {
  createUser,
  deleteUser,
  getUserByNickname,
  updateUser,
  verifyUserPassword,
} from "../db/users.js";
import { requireAuth } from "../middlewares/auth.js";
import { normalizeRoutePath } from "../utils/paths.js";
import { isUniqueViolation } from "../utils/dbErrors.js";
import { signAuthToken } from "../utils/jwt.js";

const router = Router();

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user
 *     security:
 *       - ApiAuth: []
 *     responses:
 *       200:
 *         description: Current user
 */
router.get("/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

/**
 * @openapi
 * /api/users/{nickname}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by nickname (self only)
 *     security:
 *       - ApiAuth: []
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User
 */
router.get(
  "/:nickname",
  requireAuth,
  async (req: Request<{ nickname: string }>, res) => {
    if (req.user?.nickname !== req.params.nickname) {
      res.status(403).json({ ok: false, error: "forbidden" });
      return;
    }

    const user = await getUserByNickname(req.params.nickname);
    if (!user) {
      res.status(404).json({ ok: false, error: "not found" });
      return;
    }

    res.json({ ok: true, user });
  },
);

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     tags: [Users]
 *     summary: Register user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nickname, password]
 *             properties:
 *               nickname:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered user
 */
router.post("/register", async (req, res) => {
  const { nickname, password } = req.body ?? {};
  if (typeof nickname !== "string" || nickname.trim().length < 3) {
    res
      .status(400)
      .json({ ok: false, error: "nickname must be at least 3 chars" });
    return;
  }
  if (typeof password !== "string" || password.length < 6) {
    res
      .status(400)
      .json({ ok: false, error: "password must be at least 6 chars" });
    return;
  }

  const existing = await getUserByNickname(nickname);
  if (existing) {
    res.status(409).json({ ok: false, error: "nickname already taken" });
    return;
  }

  try {
    const user = await createUser(nickname, password);
    const token = signAuthToken({ sub: user.id, nickname: user.nickname });
    res
      .cookie("auth", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({ ok: true, user });
  } catch (error) {
    if (isUniqueViolation(error)) {
      res
        .status(409)
        .json({ ok: false, error: "nickname or route already taken" });
      return;
    }
    throw error;
  }
});

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     tags: [Users]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nickname, password]
 *             properties:
 *               nickname:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in user
 */
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body ?? {};
  if (typeof nickname !== "string" || typeof password !== "string") {
    res
      .status(400)
      .json({ ok: false, error: "nickname and password are required" });
    return;
  }

  const user = await verifyUserPassword(nickname, password);
  if (!user) {
    res.status(401).json({ ok: false, error: "invalid credentials" });
    return;
  }

  const token = signAuthToken({ sub: user.id, nickname: user.nickname });
  res
    .cookie("auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .json({ ok: true, user });
});

/**
 * @openapi
 * /api/users/logout:
 *   post:
 *     tags: [Users]
 *     summary: Logout user
 *     security:
 *       - ApiAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/logout", requireAuth, (req, res) => {
  res
    .clearCookie("auth", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    .json({ ok: true });
});

/**
 * @openapi
 * /api/users/{nickname}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user (self only)
 *     security:
 *       - ApiAuth: []
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               xssPath:
 *                 type: string
 *               csrfPath:
 *                 type: string
 *               rotateToken:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated user
 */
router.patch(
  "/:nickname",
  requireAuth,
  async (req: Request<{ nickname: string }>, res) => {
    if (req.user?.nickname !== req.params.nickname) {
      res.status(403).json({ ok: false, error: "forbidden" });
      return;
    }

    const { password, oldPassword, xssPath, csrfPath } = req.body ?? {};
    const updates: {
      password?: string;
      xssPath?: string;
      csrfPath?: string;
    } = {};

    if (typeof password === "string" && password.length >= 6) {
      if (typeof oldPassword !== "string" || oldPassword.length === 0) {
        res.status(400).json({ ok: false, error: "oldPassword is required" });
        return;
      }
      const verified = await verifyUserPassword(req.params.nickname, oldPassword);
      if (!verified) {
        res.status(401).json({ ok: false, error: "invalid credentials" });
        return;
      }
      updates.password = password;
    }
    if (typeof xssPath === "string" && xssPath.length > 1) {
      const normalized = normalizeRoutePath(xssPath);
      if (normalized.startsWith("/api")) {
        res
          .status(400)
          .json({ ok: false, error: "xssPath cannot start with /api" });
        return;
      }
      updates.xssPath = normalized;
    }
    if (typeof csrfPath === "string" && csrfPath.length > 1) {
      const normalized = normalizeRoutePath(csrfPath);
      if (normalized.startsWith("/api")) {
        res
          .status(400)
          .json({ ok: false, error: "csrfPath cannot start with /api" });
        return;
      }
      updates.csrfPath = normalized;
    }
    try {
      const user = await updateUser(req.params.nickname, updates);
      if (!user) {
        res.status(404).json({ ok: false, error: "not found" });
        return;
      }

      res.json({ ok: true, user });
    } catch (error) {
      if (isUniqueViolation(error)) {
        res.status(409).json({ ok: false, error: "route already taken" });
        return;
      }
      throw error;
    }
  },
);

/**
 * @openapi
 * /api/users/{nickname}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (self only)
 *     security:
 *       - ApiAuth: []
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete(
  "/:nickname",
  requireAuth,
  async (req: Request<{ nickname: string }>, res) => {
    if (req.user?.nickname !== req.params.nickname) {
      res.status(403).json({ ok: false, error: "forbidden" });
      return;
    }

    const ok = await deleteUser(req.params.nickname);
    res.json({ ok });
  },
);

export default router;
