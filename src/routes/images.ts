import { Hono } from "hono";
import { AuthVariables } from "../types/auth-context";
import { withAuthMiddleware } from "../middleware/withAuthMiddleware";
import { getTripImage } from "../controllers/images/get";
import { markImgForDeletion } from "../controllers/images/delete";

export const imagesRoute = new Hono<{ Variables: AuthVariables }>().basePath(
  "/images"
);

imagesRoute.use("*", withAuthMiddleware);

imagesRoute.get("/:uuid", getTripImage);
imagesRoute.delete("/:uuid", markImgForDeletion);
