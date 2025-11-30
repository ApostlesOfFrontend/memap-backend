import { db } from "../../db";
import { trip } from "../../db/schemas/trip";
import { AuthContext } from "../../types/auth-context";
import { and, eq, getTableColumns } from "drizzle-orm";
import { isNumber } from "../../util/is-number";
import { HTTPException } from "hono/http-exception";
import { image } from "../../db/schemas/images";

export const getTripList = async (c: AuthContext): Promise<Response> => {
  const user = c.get("user");

  const data = await db.query.trip.findMany({
    columns: {
      createdBy: false,
    },
    where: eq(trip.createdBy, user.id),
    with: {
      points: true,
    },
  });

  return c.json(data, 200);
};

export const getTripById = async (c: AuthContext): Promise<Response> => {
  const user = c.get("user");
  const tripId = c.req.param("tripId");

  if (!isNumber(tripId))
    throw new HTTPException(403, { message: "Invalid trip id" });

  const { createdBy, ...rest } = getTableColumns(trip);

  const [tripData] = await db
    .select({ ...rest })
    .from(trip)
    .where(and(eq(trip.id, parseInt(tripId)), eq(trip.createdBy, user.id)));

  if (!tripData) throw new HTTPException(404, { message: "Not found" });

  const images = await db
    .select({ id: image.uuid, name: image.originalName })
    .from(image)
    .where(
      and(
        eq(image.tripId, parseInt(tripId)),
        eq(image.status, "processing_finised"),
        eq(image.isVisible, true)
      )
    );

  return c.json({ ...tripData, images });
};
