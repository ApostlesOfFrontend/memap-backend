import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { trip } from "./trip";
import { user } from "./auth";

export const statusesEnum = pgEnum("statuses", [
  "pending_upload",
  "upload_confirmed",
  "awaiting_processing",
  "processing_started",
  "processing_error",
  "processing_finised",
]);

export const image = pgTable("image", {
  uuid: uuid().defaultRandom().primaryKey(),
  originalName: text().notNull(),
  userSize: integer().notNull(), // user provided size, not fully trustable
  originalSize: integer().default(0), // real size checked during processing in queue, trustable
  type: text().notNull(),
  status: statusesEnum().notNull().default("pending_upload"),

  tripId: integer()
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
