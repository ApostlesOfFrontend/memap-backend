import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { trip } from "./trip";
import { user } from "./auth";

export const image = pgTable("image", {
  uuid: uuid().defaultRandom().primaryKey(),
  originalName: text().notNull(),
  size: integer().notNull(),

  tripId: integer()
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
