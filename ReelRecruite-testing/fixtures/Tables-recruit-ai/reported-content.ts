import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, text, pgEnum, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { contentTypeEnum, reportStatusEnum } from "./enums";

export const reportedContent = pgTable(
  "reported_content",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id),
    contentType: contentTypeEnum("content_type").notNull(),
    contentId: uuid("content_id").notNull(),
    reportReason: varchar("report_reason", { length: 255 }).notNull(),
    reportDescription: text("report_description"),
    status: reportStatusEnum("status").default("pending").notNull(),
    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewNotes: text("review_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
  },
  (t) => ({
    reporterIdIdx: index("reported_content_reporter_id_idx").on(t.reporterId),
    contentTypeContentIdIdx: index("reported_content_type_id_idx").on(t.contentType, t.contentId),
    statusIdx: index("reported_content_status_idx").on(t.status),
    reviewedByIdx: index("reported_content_reviewed_by_idx").on(t.reviewedBy),
  }),
);

export const reportedContentRelations = relations(reportedContent, ({ one }) => ({
  reporter: one(users, {
    fields: [reportedContent.reporterId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [reportedContent.reviewedBy],
    references: [users.id],
  }),
}));
