import { pgTable, uuid, varchar, boolean, pgEnum, timestamp, uniqueIndex, index, text } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { aclTypeEnum } from "./enums";

export const acls = pgTable(
  "acls",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    identifier: varchar("identifier", { length: 255 }).unique(),
    type: aclTypeEnum("type").notNull(),
    accessToken: text("access_token").unique(),
    refreshToken: text("refresh_token").unique(),
    isValid: boolean("is_valid").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("acls_user_id_idx").on(t.userId),
    identifierIdx: uniqueIndex("acls_identifier_idx").on(t.identifier),
    accessTokenIdx: uniqueIndex("acls_access_token_idx").on(t.accessToken),
    refreshTokenIdx: uniqueIndex("acls_refresh_token_idx").on(t.refreshToken),
  }),
);

export const aclRelations = relations(acls, ({ one }) => ({
  user: one(users, {
    fields: [acls.userId],
    references: [users.id],
  }),
}));
