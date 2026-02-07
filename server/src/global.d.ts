import type { User } from "./db/users.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
