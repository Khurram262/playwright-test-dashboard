import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { role_features } from "./role-features";

export const features = pgTable(
  "features",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 500 }).notNull(),
    isActive: boolean("is_active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: uniqueIndex("features_name_idx").on(t.name),
  }),
);

export const featureRelations = relations(features, ({ many }) => ({
  roleFeatures: many(role_features),
}));
