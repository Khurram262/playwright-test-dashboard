import { relations } from "drizzle-orm";
import { pgTable, uuid, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { jobs } from "./jobs";

export const savedCandidates = pgTable(
  "saved_candidates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recruiterId: uuid("recruiter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    recruiterIdIdx: index("saved_candidates_recruiter_id_idx").on(t.recruiterId),
    jobIdIdx: index("saved_candidates_job_id_idx").on(t.jobId),
    candidateIdIdx: index("saved_candidates_candidate_id_idx").on(t.candidateId),
    recruiterJobCandidateIdx: uniqueIndex("saved_candidates_recruiter_job_candidate_idx").on(t.recruiterId, t.jobId, t.candidateId),
  }),
);

export const savedCandidatesRelations = relations(savedCandidates, ({ one }) => ({
  recruiter: one(users, {
    fields: [savedCandidates.recruiterId],
    references: [users.id],
    relationName: "recruiterSavedCandidates",
  }),
  job: one(jobs, {
    fields: [savedCandidates.jobId],
    references: [jobs.id],
  }),
  candidate: one(users, {
    fields: [savedCandidates.candidateId],
    references: [users.id],
    relationName: "candidateSavedBy",
  }),
}));
