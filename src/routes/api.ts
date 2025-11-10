import { Hono } from "hono";
import { tripsRoutes } from "./trips";

export const apiRouter = new Hono().basePath("/api");

apiRouter.route("/", tripsRoutes);
