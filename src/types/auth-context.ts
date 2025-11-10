import type { Session, User } from "better-auth/types";
import { Context } from "hono";

export interface OptionalAuthVariables {
  user: User | null;
  session: Session | null;
}

export interface AuthVariables {
  user: User;
  session: Session;
}

export type AuthContext = Context<{ Variables: AuthVariables }>;
