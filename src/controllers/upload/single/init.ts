import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AuthContext } from "../../../types/auth-context";
import { S3 } from "../../../lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 } from "uuid";
import { validateBody } from "../../../lib/validate-body";
import { singleFileSchema } from "./schemas/single-file-schema";
import { uploadUserQuota } from "./helpers/upload-user-quota";
import { db } from "../../../db";
import { image } from "../../../db/schemas/images";

export const initializeUpload = async (c: AuthContext): Promise<Response> => {
  const user = c.get("user");

  const body = validateBody(singleFileSchema, await c.req.json());

  // TODO: handle concurrency control - might need quota table with optimistic locking
  await uploadUserQuota(user.id, body.tripId);

  const imageUuid = v4();
  const s3Key = `originals/${user.id}/${body.tripId}/${imageUuid}`;

  const signedUrl = await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: s3Key,
    }),
    { expiresIn: 3600 },
  );

  await db.insert(image).values({
    originalName: body.name,
    userId: user.id,
    uuid: imageUuid,
    tripId: body.tripId,
    type: body.type,
    userSize: body.size,
  });

  return c.json({ signedUrl, uuid: imageUuid });
};
