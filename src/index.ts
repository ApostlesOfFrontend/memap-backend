import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./lib/auth";
import { apiRouter } from "./routes/api";
import { cors } from "hono/cors";
import { getEnvVar } from "./util/get-env-var";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "https://me-map.xyz",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/", apiRouter);

serve(
  {
    fetch: app.fetch,
    port: parseInt(getEnvVar("APP_PORT")),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
