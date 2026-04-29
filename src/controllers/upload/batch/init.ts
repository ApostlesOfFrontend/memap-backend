import { validateBody } from "@/lib/validate-body";
import { AuthContext } from "@/types/auth-context";
import { batchFileSchema } from "../single/schemas/single-file-schema";
import { v4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/db";
import { image } from "@/db/schemas/images";

export const initializeBatchUpload = async (
  c: AuthContext,
): Promise<Response> => {
  const user = c.get("user");

  const body = validateBody(batchFileSchema, await c.req.json());

  const { tripId, points } = body;

  const photos = [];
  const inserts = [];

  for (const point of points) {
    const { pointId, files } = point;

    for (const file of files) {
      const imageUuid = v4();
      const s3Key = `originals/${user.id}/${tripId}/${imageUuid}`;

      const signedUrl = await getSignedUrl(
        S3,
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: s3Key,
          ContentType: file.type,
          ChecksumAlgorithm: undefined,
        }),
        { expiresIn: 3600 },
      );

      inserts.push({
        originalName: file.name,
        userId: user.id,
        uuid: imageUuid,
        tripId: tripId,
        type: file.type,
        userSize: file.size,
        pointId: pointId,
      });

      photos.push({
        signedUrl,
        uuid: imageUuid,
        type: file.type,
        pointId,
        clientId: file.clientId,
      });
    }
  }

  await db.insert(image).values(inserts);

  return c.json(photos);
};
