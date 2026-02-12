import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { role_features } from "./role-features";

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).unique().notNull(),
    description: varchar("description", { length: 500 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: uniqueIndex("roles_name_idx").on(t.name),
  }),
);

export const roleRelations = relations(roles, ({ many }) => ({
  users: many(users),
  roleFeatures: many(role_features),
}));
