import type { User } from "./db/userStore.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
