import z from "zod";
import { MAX_SIZE_B, MIN_SIZE_B } from "../../../../consts/file-upload";

export const singleFileSchema = z.object({
  name: z.string().nonempty(),
  size: z.number().min(MIN_SIZE_B).max(MAX_SIZE_B),
  type: z.enum(["image/png", "image/jpeg"]),
  tripId: z.number().nonnegative(),
  pointId: z.number().nonnegative(),
});

export const completeUploadSchema = z.object({
  tripId: z.number().nonnegative(),
  imageUuid: z.uuidv4().nonempty(),
});

export const batchFileSchema = z.object({
  tripId: z.number().nonnegative(),
  points: z.array(
    z.object({
      pointId: z.number().nonnegative(),
      files: z.array(
        z.object({
          clientId: z.string().nonempty(),
          name: z.string().nonempty(),
          size: z.number().min(MIN_SIZE_B).max(MAX_SIZE_B),
          type: z.enum(["image/png", "image/jpeg"]),
        }),
      ),
    }),
  ),
});

export const completeBatchUploadSchema = z.object({
  tripId: z.number().nonnegative(),
  points: z.array(
    z.object({
      pointId: z.number().nonnegative(),
      images: z.array(z.string().nonempty()),
    }),
  ),
});
