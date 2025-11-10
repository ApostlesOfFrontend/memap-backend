import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { point, pointRelations, trip, tripRelations } from "./schemas/trip";
import { user, account, session, verification } from "./schemas/auth";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: {
    point,
    trip,
    user,
    account,
    session,
    verification,
    tripRelations,
    pointRelations,
  },
});
