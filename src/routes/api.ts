import { Hono } from "hono";
import { tripsRoutes } from "./trips";
import { uploadRoute } from "./upload";
import { imagesRoute } from "./images";

export const apiRouter = new Hono().basePath("/api");

apiRouter.route("/", tripsRoutes);
apiRouter.route("/", uploadRoute);
apiRouter.route("/", imagesRoute);
