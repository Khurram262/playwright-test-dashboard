import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, text, jsonb, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { notificationStatusEnum, notificationTypeEnum } from "./enums";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull().default("info"),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    data: jsonb("data").notNull().default({}),
    status: notificationStatusEnum("status").notNull().default("un-read"),
    readAt: timestamp("read_at", { withTimezone: true }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("notifications_user_id_idx").on(t.userId),
    statusIdx: index("notifications_status_idx").on(t.status),
    typeIdx: index("notifications_type_idx").on(t.type),
    createdAtIdx: index("notifications_created_at_idx").on(t.createdAt),
    isDeletedIdx: index("notifications_is_deleted_idx").on(t.isDeleted),
  }),
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
