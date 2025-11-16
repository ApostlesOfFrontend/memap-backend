import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AuthContext } from "../../../types/auth-context";
import { S3 } from "../../../lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 } from "uuid";

export const initializeUpload = async (c: AuthContext): Promise<Response> => {
  const user = c.get("user");

  const imageUuid = v4();
  const s3Key = `originals/${user.id}/${imageUuid}`;
  console.log(process.env.S3_BUCKET);

  const signedUrl = await getSignedUrl(
    S3,
    new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: s3Key })
  );

  console.log(signedUrl);

  return c.json({ signedUrl });
};
