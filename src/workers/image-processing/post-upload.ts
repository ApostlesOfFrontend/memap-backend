import { Worker } from "bullmq";
import { db } from "../../db";
import { image } from "../../db/schemas/images";
import { eq } from "drizzle-orm";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { ImageProcessingArgs } from "./types/job";
import {
  getFullResS3Key,
  getOriginalsS3Key,
  getThumbnailS3Key,
} from "../../controllers/upload/single/helpers/get-s3-key";
import { S3 } from "../../lib/s3";
import sharp from "sharp";
import { connection } from "../../lib/redis-connection";

const worker = new Worker<ImageProcessingArgs>(
  "image-processing",
  async (job) => {
    await db
      .update(image)
      .set({ status: "processing_started" })
      .where(eq(image.uuid, job.data.imageId));

    const { imageId, owner, tripId } = job.data;
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: getOriginalsS3Key(owner, tripId, imageId),
    });

    const img = await S3.send(getCommand);

    const imageBuffer = await img.Body?.transformToByteArray();
    if (!imageBuffer) {
      throw new Error("Failed to read image data");
    }

    const metadata = await sharp(imageBuffer).metadata();

    // Generate thumbnail (400px on the longer side)
    const thumbnailSize = 400;
    const thumbnail = await sharp(imageBuffer)
      .resize(thumbnailSize, thumbnailSize, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Only resize if the image is really large (e.g., > 3000px on any side)
    const maxDimension = 3000; // Adjust based on your needs
    let compressedPipeline = sharp(imageBuffer);

    if (metadata.width && metadata.height) {
      const needsResize =
        metadata.width > maxDimension || metadata.height > maxDimension;

      if (needsResize) {
        // Resize based on the longer side
        if (metadata.width > metadata.height) {
          // Landscape
          compressedPipeline = compressedPipeline.resize(maxDimension, null, {
            fit: "inside",
            withoutEnlargement: true,
          });
        } else {
          // Portrait or square
          compressedPipeline = compressedPipeline.resize(null, maxDimension, {
            fit: "inside",
            withoutEnlargement: true,
          });
        }
      }
    }

    const compressed = await compressedPipeline
      .webp({ quality: 85 }) // WebP with good quality
      .toBuffer();

    await S3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: getThumbnailS3Key(owner, tripId, imageId),
        Body: thumbnail,
        ContentType: "image/webp",
      }),
    );

    // Upload compressed version to S3
    await S3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: getFullResS3Key(owner, tripId, imageId),
        Body: compressed,
        ContentType: "image/webp",
      }),
    );
  },
  { connection: connection },
);

worker.on("completed", async (job) => {
  await db
    .update(image)
    .set({ status: "processing_finised", isVisible: true })
    .where(eq(image.uuid, job.data.imageId));
});

worker.on("failed", async (job) => {
  if (!job) {
    console.error(
      "Failure occurred while processing a job and job data is missing",
    );
    return;
  }
  await db
    .update(image)
    .set({ status: "processing_error" })
    .where(eq(image.uuid, job.data.imageId));
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing worker...`);
  await worker.close();
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
