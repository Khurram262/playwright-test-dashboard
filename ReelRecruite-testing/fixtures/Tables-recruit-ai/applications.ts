import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, text, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { jobs } from "./jobs";
import { applicationFields } from "./application-fields";
import { applicationAnswers } from "./application-answers";
import { applicationStatusEnum } from "./enums";

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => users.id),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id),

    status: applicationStatusEnum("status").default("pending").notNull(),

    // Documents
    videoUrl: varchar("video_url", { length: 500 }),

    // Internal notes
    recruiterNotes: text("recruiter_notes"),
    rejectionReason: text("rejection_reason"),

    // Timestamps
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    candidateIdIdx: index("applications_candidate_id_idx").on(t.candidateId),
    jobIdIdx: index("applications_job_id_idx").on(t.jobId),
    statusIdx: index("applications_status_idx").on(t.status),
    submittedAtIdx: index("applications_submitted_at_idx").on(t.submittedAt),
    candidateJobIdx: uniqueIndex("applications_candidate_job_idx").on(t.candidateId, t.jobId),
  }),
);

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  candidate: one(users, {
    fields: [applications.candidateId],
    references: [users.id],
    relationName: "userApplications",
  }),
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  fields: many(applicationFields),
  answers: many(applicationAnswers),
}));
