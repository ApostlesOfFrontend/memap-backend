import type { Context } from "hono";
import { db } from "../../db/index";
import { point, trip } from "../../db/schemas/trip";

export const createTrip = async (c: Context): Promise<Response> => {
  const body = await c.req.json();
  console.log("body", body);
  const user = c.get("user");
  console.log("user", user);

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

    const preparedInsert = body.route.map((poi) => ({
      tripId: created.id,
      name: poi.name,
      lat: poi.location[0],
      lng: poi.location[1],
      createdBy: user.id,
    }));
    await tx.insert(point).values(preparedInsert);
  });

  return c.json({ msg: "Trip created successfuly" }, 200);
};
