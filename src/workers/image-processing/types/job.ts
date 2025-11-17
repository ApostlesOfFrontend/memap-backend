import { Job } from "bullmq";

export type ImageProcessingArgs = {
  owner: string;
  imageId: string;
  tripId: number;
};

export type ImageProcessingJob = Job<ImageProcessingArgs>;
