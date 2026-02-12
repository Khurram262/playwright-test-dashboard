import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { role_feature_permissions } from "./role-feature-permissions";

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 500 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index("permissions_name_idx").on(t.name),
  }),
);

export const permissionRelations = relations(permissions, ({ many }) => ({
  roleFeaturePermissions: many(role_feature_permissions),
}));
