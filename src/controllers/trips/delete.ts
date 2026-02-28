import { db } from "@/db";
import { image } from "@/db/schemas/images";
import { trip } from "@/db/schemas/trip";
import { AuthContext } from "@/types/auth-context";
import { isNumber } from "@/util/is-number";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export const deleteTripById = async (c: AuthContext): Promise<Response> => {
  const user = c.get("user");
  const tripId = c.req.param("tripId");

  if (!isNumber(tripId))
    throw new HTTPException(403, { message: "Invalid trip id" });

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(trip)
        .set({ isVisible: false, markedForDeletion: true })
        .where(and(eq(trip.id, parseInt(tripId)), eq(trip.createdBy, user.id)));

      await tx
        .update(image)
        .set({ isVisible: false, status: "marked_for_deletion" })
        .where(
          and(eq(image.tripId, parseInt(tripId)), eq(image.userId, user.id)),
        );
    });
  } catch (e) {
    throw new HTTPException(500, { message: "Error while deleting trip" });
  }

  return c.json({ msg: "Trip deleted successfully" }, 200);
};
