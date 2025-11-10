import { betterAuth } from "better-auth";
import { db } from "../db/index";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, session, user, verification } from "../db/schemas/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema: {
      user,
      session,
      account,
      verification,
    },
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
