import { Queue } from "bullmq";
import { connection } from "./redis-connection";

export const imageProcessingQueue = new Queue("image-processing", {
  connection: connection,
});
