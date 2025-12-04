import { and, eq } from "drizzle-orm";
import { db } from "../../../db";
import { image } from "../../../db/schemas/images";
import { validateBody } from "../../../lib/validate-body";
import { AuthContext } from "../../../types/auth-context";
import { completeUploadSchema } from "./schemas/single-file-schema";
import { HTTPException } from "hono/http-exception";
import { imageProcessingQueue } from "../../../lib/queue";
import { S3 } from "../../../lib/s3";
import { HeadObjectCommand, HeadObjectCommandOutput } from "@aws-sdk/client-s3";
import { getOriginalsS3Key } from "./helpers/get-s3-key";

export const completeUpload = async (c: AuthContext): Promise<Response> => {
  const user = c.get("user");

  const body = validateBody(completeUploadSchema, await c.req.json());

  const [img] = await db
    .select()
    .from(image)
    .where(and(eq(image.userId, user.id), eq(image.uuid, body.imageUuid)));

  if (!img) throw new HTTPException(404, { message: "No such image" });

  //TODO: here we can get real image data. We can check real size user quota here and proceed with enqueing image processing job only if quota not exceeded
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: getOriginalsS3Key(user.id, body.tripId, body.imageUuid),
    });
    await S3.send(headCommand);
  } catch (error: any) {
    if (error.name === "NotFound")
      throw new HTTPException(404, { message: "File not found" });

    throw new HTTPException(500, {
      message: "Failed to retrieve file information",
    });
  }

  await db
    .update(image)
    .set({ status: "upload_confirmed" })
    .where(eq(image.uuid, body.imageUuid)); // already ensured user is owner

  await imageProcessingQueue.add(`img-${img.uuid}-processing`, {
    owner: user.id,
    imageId: img.uuid,
    tripId: body.tripId,
  });

  await db
    .update(image)
    .set({ status: "awaiting_processing" })
    .where(eq(image.uuid, body.imageUuid)); // already ensured user is owner

  return c.json({ status: "success", uuid: img.uuid }, 201);
};
