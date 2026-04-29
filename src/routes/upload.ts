import { Hono } from "hono";
import { AuthVariables } from "../types/auth-context";
import { withAuthMiddleware } from "../middleware/withAuthMiddleware";
import { initializeUpload } from "../controllers/upload/single/init";
import { completeUpload } from "../controllers/upload/single/complete";
import { initializeBatchUpload } from "@/controllers/upload/batch/init";
import { completeBatchUpload } from "@/controllers/upload/batch/complete";

export const uploadRoute = new Hono<{ Variables: AuthVariables }>().basePath(
  "/upload",
);

uploadRoute.use("*", withAuthMiddleware);

uploadRoute.post("/single/init", initializeUpload);
uploadRoute.post("/single/confirm", completeUpload);

uploadRoute.post("/batch/init", initializeBatchUpload);
uploadRoute.post("/batch/confirm", completeBatchUpload);
