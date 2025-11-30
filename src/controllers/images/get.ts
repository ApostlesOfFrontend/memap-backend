import { HTTPException } from "hono/http-exception";
import { db } from "../../db";
import { image } from "../../db/schemas/images";
import { AuthContext } from "../../types/auth-context";
import { and, eq } from "drizzle-orm";
import {
  getFullResS3Key,
  getThumbnailS3Key,
} from "../upload/single/helpers/get-s3-key";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "../../lib/s3";

export const getTripImage = async (c: AuthContext): Promise<Response> => {
  const user = c.get("user");
  const imageUuid = c.req.param("uuid");
  const { type } = c.req.query();

  console.log("endpoint was hit");

  const [imgData] = await db
    .select()
    .from(image)
    .where(
      and(eq(image.uuid, imageUuid), eq(image.status, "processing_finised"))
    );
  if (!imgData) throw new HTTPException(404, { message: "Image not found" });
  if (user.id !== imgData.userId) throw new HTTPException(403);

  const getS3Key = type === "thumbnail" ? getThumbnailS3Key : getFullResS3Key;
  const s3Key = getS3Key(user.id, imgData.tripId, imageUuid);

  const getCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: s3Key,
  });

  const img = await S3.send(getCommand);

  if (!img.Body) {
    throw new HTTPException(404, { message: "Image data not found" });
  }

  return new Response(img.Body.transformToWebStream(), {
    headers: {
      "Content-Type": img.ContentType || "image/jpeg",
      "Content-Length": img.ContentLength?.toString() || "",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
