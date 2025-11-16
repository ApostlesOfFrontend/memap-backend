import { Hono } from "hono";
import { tripsRoutes } from "./trips";
import { uploadRoute } from "./upload";

export const apiRouter = new Hono().basePath("/api");

apiRouter.route("/", tripsRoutes);
apiRouter.route("/", uploadRoute);
