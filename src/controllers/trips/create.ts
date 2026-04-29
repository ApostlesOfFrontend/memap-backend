import { db } from "../../db/index";
import { point, trip } from "../../db/schemas/trip";
import { AuthContext } from "../../types/auth-context";
import { validateBody } from "../../lib/validate-body";
import { createTripSchema } from "./schemas/create";

export const createTrip = async (c: AuthContext): Promise<Response> => {
  const body = validateBody(createTripSchema, await c.req.json());

  const user = c.get("user");

  const data = await db.transaction(async (tx) => {
    const [createdTrip] = await tx
      .insert(trip)
      .values({
        name: body.title,
        description: body.description,
        dateFrom: new Date(body.dates.from),
        dateTo: new Date(body.dates.to),
        createdBy: user.id,
      })
      .returning();

    if (!createdTrip) throw Error("Error while creating trip.");

    const createdPoints = await tx
      .insert(point)
      .values(
        body.route.map((poi) => ({
          tripId: createdTrip.id,
          name: poi.name,
          lat: poi.location[1],
          lng: poi.location[0],
        })),
      )
      .returning();
    if (!createdTrip) throw Error("Error while creating trip points.");

    return { createdTrip, createdPoints };
  });

  if (data.createdPoints.length !== body.route.length) {
    throw Error("Trip points not created correctly.");
  }

  const toReturn = {
    id: data.createdTrip.id,
    name: data.createdTrip.name,
    description: data.createdTrip.description,
    dateFrom: data.createdTrip.dateFrom,
    dateTo: data.createdTrip.dateTo,
    points: data.createdPoints.map((p, idx) => ({
      id: p.id,
      clientId: body.route[idx].clientId,
      name: p.name,
      location: [p.lng, p.lat],
    })),
  };

  return c.json(toReturn, 200);
};
