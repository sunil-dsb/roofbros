import type { AuthSession } from '../shared/utils/auth.ts';

declare global {
  namespace Express {
    interface Request {
      /** Populated by `requireAuth`; absent on unauthenticated routes. */
      auth?: AuthSession;
    }
  }
}

export {};
