import { pgTable, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { roles } from "./roles";
import { features } from "./features";
import { relations } from "drizzle-orm";
import { role_feature_permissions } from "./role-feature-permissions";

export const role_features = pgTable(
  "role_features",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    featureId: uuid("feature_id")
      .notNull()
      .references(() => features.id, { onDelete: "cascade" }),
  },
  (t) => ({
    uniq: uniqueIndex("uniq_role_feature").on(t.roleId, t.featureId),
  }),
);

export const roleFeatureRelations = relations(role_features, ({ one, many }) => ({
  role: one(roles, {
    fields: [role_features.roleId],
    references: [roles.id],
  }),
  feature: one(features, {
    fields: [role_features.featureId],
    references: [features.id],
  }),
  roleFeaturePermissions: many(role_feature_permissions),
}));
