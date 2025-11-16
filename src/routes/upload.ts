import { Hono } from "hono";
import { AuthVariables } from "../types/auth-context";
import { withAuthMiddleware } from "../middleware/withAuthMiddleware";
import { initializeUpload } from "../controllers/upload/single/init";

export const uploadRoute = new Hono<{ Variables: AuthVariables }>().basePath(
  "/upload"
);

uploadRoute.use("*", withAuthMiddleware);

uploadRoute.post("/single/init", initializeUpload);
