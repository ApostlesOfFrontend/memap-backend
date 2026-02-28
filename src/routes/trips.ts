import { Hono } from "hono";
import { createTrip } from "../controllers/trips/create";
import { withAuthMiddleware } from "../middleware/withAuthMiddleware";
import { AuthVariables } from "../types/auth-context";
import { getTripById, getTripList } from "../controllers/trips/get";
import { deleteTripById } from "@/controllers/trips/delete";

export const tripsRoutes = new Hono<{ Variables: AuthVariables }>().basePath(
  "/trips",
);

tripsRoutes.use("*", withAuthMiddleware);

tripsRoutes.post("/", createTrip);
tripsRoutes.get("/", getTripList);

tripsRoutes.get("/:tripId", getTripById);
tripsRoutes.delete("/:tripId", deleteTripById);
