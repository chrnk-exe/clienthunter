import { Router } from "express";
import usersRouter from "./users.js";
import csrfPayloadsRouter from "./csrf-payloads.js";
import xssPayloadsRouter from "./xss-payloads.js";

const router = Router();

router.use("/users", usersRouter);
router.use("/csrf-payloads", csrfPayloadsRouter);
router.use("/xss-payloads", xssPayloadsRouter);

export default router;
