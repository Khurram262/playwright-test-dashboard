import { relations } from "drizzle-orm";
import { pgTable, uuid, boolean, integer, timestamp, text, jsonb, index } from "drizzle-orm/pg-core";
import { jobs } from "./jobs";
import { applicationAnswers } from "./application-answers";
import { questionTypeEnum } from "./enums";

export const jobQuestions = pgTable(
  "job_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),

    // Question Definition
    question: text("question").notNull(),
    questionType: questionTypeEnum("question_type").notNull(),

    // Options & Validation
    options: jsonb("options"), // For choice questions
    isRequired: boolean("is_required").default(false).notNull(),
    expectedAnswer: jsonb("expected_answer"), // For future auto-screening

    // Presentation
    orderIndex: integer("order_index").notNull(),
    helpText: text("help_text"),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    jobIdIdx: index("job_questions_job_id_idx").on(t.jobId),
    jobIdOrderIdx: index("job_questions_job_id_order_idx").on(t.jobId, t.orderIndex),
  }),
);

export const jobQuestionsRelations = relations(jobQuestions, ({ one, many }) => ({
  job: one(jobs, {
    fields: [jobQuestions.jobId],
    references: [jobs.id],
  }),
  applicationAnswers: many(applicationAnswers),
}));
