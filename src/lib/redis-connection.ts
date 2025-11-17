import { ConnectionOptions } from "bullmq";

export const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || ""),
  maxRetriesPerRequest: 3,
};
