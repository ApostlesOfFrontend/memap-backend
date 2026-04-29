import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { db } from "@/db";
import { image } from "@/db/schemas/images";
import { imageProcessingQueue } from "@/lib/queue";
import { S3 } from "@/lib/s3";
import { validateBody } from "@/lib/validate-body";
import { AuthContext } from "@/types/auth-context";
import { completeBatchUploadSchema } from "../single/schemas/single-file-schema";
import { getOriginalsS3Key } from "../single/helpers/get-s3-key";

export const completeBatchUpload = async (
  c: AuthContext,
): Promise<Response> => {
  const user = c.get("user");

  const body = validateBody(completeBatchUploadSchema, await c.req.json());

  const requestedImages = body.points.flatMap(({ pointId, images }) =>
    images.map((imageUuid) => ({ imageUuid, pointId })),
  );
  const imageUuids = requestedImages.map(({ imageUuid }) => imageUuid);

  if (imageUuids.length === 0) {
    return c.json({ status: "success", images: [] }, 201);
  }

  const pointIdByImageUuid = new Map(
    requestedImages.map(({ imageUuid, pointId }) => [imageUuid, pointId]),
  );

  const images = await db
    .select()
    .from(image)
    .where(
      and(
        eq(image.userId, user.id),
        eq(image.tripId, body.tripId),
        inArray(image.uuid, imageUuids),
      ),
    );

  if (images.length !== imageUuids.length) {
    throw new HTTPException(404, { message: "Some images were not found" });
  }

  for (const img of images) {
    if (img.pointId !== pointIdByImageUuid.get(img.uuid)) {
      throw new HTTPException(404, { message: "Some images were not found" });
    }
  }

  try {
    await Promise.all(
      images.map((img) =>
        S3.send(
          new HeadObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: getOriginalsS3Key(user.id, body.tripId, img.uuid),
          }),
        ),
      ),
    );
  } catch (error: any) {
    if (error.name === "NotFound") {
      throw new HTTPException(404, { message: "Some files were not found" });
    }

    throw new HTTPException(500, {
      message: "Failed to retrieve file information",
    });
  }

  await db
    .update(image)
    .set({ status: "upload_confirmed" })
    .where(
      and(
        eq(image.userId, user.id),
        eq(image.tripId, body.tripId),
        inArray(image.uuid, imageUuids),
      ),
    );

  // TODO: fix error handling here. Currently when queue addition fails, some of the images might be already marked as awaiting_processing while some not. We can end up in a state when all images are marked as awaiting_processing but some aren't actually in queue
  await imageProcessingQueue.addBulk(
    images.map((img) => ({
      name: `img-${img.uuid}-processing`,
      data: {
        owner: user.id,
        imageId: img.uuid,
        tripId: body.tripId,
      },
    })),
  );

  await db
    .update(image)
    .set({ status: "awaiting_processing" })
    .where(
      and(
        eq(image.userId, user.id),
        eq(image.tripId, body.tripId),
        inArray(image.uuid, imageUuids),
      ),
    );

  return c.json({ status: "success", images: imageUuids }, 201);
};
