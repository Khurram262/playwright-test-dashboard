import { relations } from "drizzle-orm";
import { pgTable, uuid, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { chatStatusEnum } from "./enums";
import { messages } from "./messages";

export const chats = pgTable(
  "chats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recruiterId: uuid("recruiter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: chatStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    archivedAt: timestamp("archived_at"),
    closedAt: timestamp("closed_at"),
  },
  (t) => ({
    recruiterIdIdx: index("chats_recruiter_id_idx").on(t.recruiterId),
    candidateIdIdx: index("chats_candidate_id_idx").on(t.candidateId),
    statusIdx: index("chats_status_idx").on(t.status),
    recruiterCandidateIdx: uniqueIndex("chats_recruiter_candidate_idx").on(t.recruiterId, t.candidateId),
    createdAtIdx: index("chats_created_at_idx").on(t.createdAt),
  }),
);

export const chatsRelations = relations(chats, ({ one, many }) => ({
  recruiter: one(users, {
    fields: [chats.recruiterId],
    references: [users.id],
    relationName: "recruiterChats",
  }),
  candidate: one(users, {
    fields: [chats.candidateId],
    references: [users.id],
    relationName: "candidateChats",
  }),
  messages: many(messages),
}));
