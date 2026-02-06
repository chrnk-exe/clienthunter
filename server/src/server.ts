import express from "express";
import type { Application, Request, Response } from "express";
import apiRouter from "./routes/index.js";

const app: Application = express();
const port = 3000;

app.use(express.json());
app.use("/api", apiRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express & TypeScript!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
