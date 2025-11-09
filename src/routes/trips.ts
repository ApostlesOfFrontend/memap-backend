import { Hono } from "hono";
import { createTrip } from "../controllers/trips/create";
import { withAuthMiddleware } from "../middleware/withAuthMiddleware";

export const tripsRoutes = new Hono().basePath("/trips");

tripsRoutes.use("*", withAuthMiddleware);

tripsRoutes.post("/", createTrip);
