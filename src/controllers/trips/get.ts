import { db } from "../../db";
import { point, trip } from "../../db/schemas/trip";
import { AuthContext } from "../../types/auth-context";
import { eq } from "drizzle-orm";

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
