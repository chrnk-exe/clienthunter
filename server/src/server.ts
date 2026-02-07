import "dotenv/config";
import express from "express";
import type { Application, Request, Response } from "express";
import apiRouter from "./routes/index.js";
import { ensureSchema } from "./db/schema.js";
import { getRouteOwner } from "./db/users.js";
import { recordCallback } from "./db/callbacks.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app: Application = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);

if (process.env.NODE_ENV !== "production") {
  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "ClientHunter API",
        version: "0.1.0",
      },
      components: {
        securitySchemes: {
          ApiAuth: {
            type: "apiKey",
            in: "cookie",
            name: "auth",
            description: "JWT in HttpOnly cookie",
          },
        },
      },
    },
    apis: ["./src/routes/*.ts"],
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(async (req, res, next) => {
  if (req.path.startsWith("/api")) {
    next();
    return;
  }

  const match = await getRouteOwner(req.path);
  if (!match) {
    next();
    return;
  }

  const body =
    typeof req.body === "string"
      ? req.body
      : req.body
      ? JSON.stringify(req.body)
      : null;

  await recordCallback({
    userId: match.user.id,
    type: match.type,
    path: req.path,
    method: req.method,
    ip: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
    headers: req.headers,
    query: req.query ?? {},
    body,
  });

  if (match.type === "xss") {
    res.status(204).end();
    return;
  }

  res.status(200).type("text/html").send("<!doctype html><html><body>OK</body></html>");
});

app.use("/api", apiRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express & TypeScript!");
});

async function start() {
  await ensureSchema();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to initialize database schema:", error);
  process.exit(1);
});
