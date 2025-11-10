import { relations, sql } from "drizzle-orm";
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
  lat: numeric({ precision: 10, scale: 7, mode: "number" }).notNull(),
  lng: numeric({ precision: 10, scale: 7, mode: "number" }).notNull(),
});

export const tripRelations = relations(trip, ({ many, one }) => ({
  points: many(point),
  creator: one(user, {
    fields: [trip.createdBy],
    references: [user.id],
  }),
}));

export const pointRelations = relations(point, ({ one }) => ({
  trip: one(trip, {
    fields: [point.tripId],
    references: [trip.id],
  }),
}));
