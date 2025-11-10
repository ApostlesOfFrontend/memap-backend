// src/routes/trip.ts
import { Hono } from "hono";
import { createTrip } from "../controllers/trips/create";
import { withAuthMiddleware } from "../middleware/withAuthMiddleware";
import { AuthVariables } from "../types/auth-context";
import { getTripList } from "../controllers/trips/get";

export const tripsRoutes = new Hono<{ Variables: AuthVariables }>().basePath(
  "/trips"
);

tripsRoutes.use("*", withAuthMiddleware);
tripsRoutes.post("/", createTrip);
tripsRoutes.get("/", getTripList);
