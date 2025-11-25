import { and, count, eq } from "drizzle-orm";
import { db } from "../../../../db";
import { image } from "../../../../db/schemas/images";
import { TRIP_TOTAL_IMG, USER_TOTAL_IMG } from "../../../../consts/file-upload";
import { HTTPException } from "hono/http-exception";

export const uploadUserQuota = async (userId: string, tripId: number) => {
  await db.transaction(async (tx) => {
    const totalUserImages = await tx
      .select({ count: count() })
      .from(image)
      .where(eq(image.userId, userId));

    console.log({ totalUserImages });

    if (totalUserImages[0].count >= USER_TOTAL_IMG)
      throw new HTTPException(403, { message: "Quota exceeded" });

    const imagesPerTrip = await tx
      .select({ count: count() })
      .from(image)
      .where(and(eq(image.userId, userId), eq(image.tripId, tripId)));
    console.log({ imagesPerTrip });

    if (imagesPerTrip[0].count >= TRIP_TOTAL_IMG)
      throw new HTTPException(403, { message: "Quota exceeded" });
  });
};
