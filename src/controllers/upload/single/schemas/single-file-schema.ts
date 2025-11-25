import z from "zod";
import { MAX_SIZE_B, MIN_SIZE_B } from "../../../../consts/file-upload";

export const singleFileSchema = z.object({
  name: z.string().nonempty(),
  size: z.number().min(MIN_SIZE_B).max(MAX_SIZE_B),
  type: z.enum(["image/png", "image/jpeg"]),
  tripId: z.number().nonnegative(),
});

export const completeUploadSchema = z.object({
  tripId: z.number().nonnegative(),
  imageUuid: z.uuidv4().nonempty(),
});
