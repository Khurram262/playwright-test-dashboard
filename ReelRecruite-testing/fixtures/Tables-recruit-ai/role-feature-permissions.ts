import { pgTable, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { role_features } from "./role-features";
import { permissions } from "./permissions";
import { relations } from "drizzle-orm";

export const role_feature_permissions = pgTable(
  "role_feature_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roleFeatureId: uuid("role_feature_id")
      .notNull()
      .references(() => role_features.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => ({
    uniq: uniqueIndex("uniq_role_feature_permission").on(t.roleFeatureId, t.permissionId),
  }),
);

export const roleFeaturePermissionRelations = relations(role_feature_permissions, ({ one }) => ({
  roleFeature: one(role_features, {
    fields: [role_feature_permissions.roleFeatureId],
    references: [role_features.id],
  }),
  permission: one(permissions, {
    fields: [role_feature_permissions.permissionId],
    references: [permissions.id],
  }),
}));
