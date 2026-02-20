import { betterAuth } from "better-auth";
import { db } from "../db/index";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, session, user, verification } from "../db/schemas/auth";
import { getEnvVar } from "@/util/get-env-var";

export const auth = betterAuth({
  baseURL: getEnvVar("BETTER_AUTH_URL"),
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
  socialProviders: {
    google: {
      clientId: getEnvVar("GOOGLE_CLIENT_ID"),
      clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET"),
    },
  },
  trustedOrigins: ["http://localhost:3000", "https://me-map.xyz"],
});
