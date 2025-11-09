import type { Context, Next } from "hono";
import { auth } from "../lib/auth";
import { HTTPException } from "hono/http-exception";

export const withAuthMiddleware = async (c: Context, next: Next) => {
  console.log(c.req.raw.headers);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  console.log(session);

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    throw new HTTPException(403, { message: "Unauthorized" });
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};
