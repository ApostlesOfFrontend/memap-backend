import type { Context } from "hono";
import { db } from "../../db/index";
import { point, trip } from "../../db/schemas/trip";
import { AuthContext } from "../../types/auth-context";
import { validateBody } from "../../lib/valudate-body";
import { createTripSchema } from "./schemas/create";

export const createTrip = async (c: AuthContext): Promise<Response> => {
  const body = validateBody(createTripSchema, await c.req.json());

  const user = c.get("user");

  await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(trip)
      .values({
        name: body.title,
        description: body.description,
        dateFrom: new Date(body.dates.from),
        dateTo: new Date(body.dates.to),
        createdBy: user.id,
      })
      .returning();

    if (!created) throw Error("Error while creating trip.");

    await tx.insert(point).values(
      body.route.map((poi) => ({
        tripId: created.id,
        name: poi.name,
        lat: poi.location[1],
        lng: poi.location[0],
      }))
    );
  });

  return c.json({ msg: "Trip created successfully" }, 200);
};
