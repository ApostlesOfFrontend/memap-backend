// src/middleware/withAuth.Middleware.ts
import type { Context, Next } from "hono";
import { auth } from "../lib/auth";
import { HTTPException } from "hono/http-exception";
import { OptionalAuthVariables } from "../types/auth-context";

export const withAuthMiddleware = async (
  c: Context<{ Variables: OptionalAuthVariables }>,
  next: Next
) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    throw new HTTPException(403, { message: "Unauthorized" });
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};
