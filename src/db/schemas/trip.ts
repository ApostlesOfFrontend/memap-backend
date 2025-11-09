import { sql } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const trip = pgTable("trip", {
  id: serial().notNull().primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
  dateFrom: timestamp().notNull(),
  dateTo: timestamp().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
  createdBy: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const point = pgTable("point", {
  id: serial().notNull().primaryKey(),
  tripId: integer()
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  name: text(),
  lat: numeric({ precision: 10 }).notNull(),
  lng: numeric({ precision: 10 }).notNull(),
  createdBy: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
