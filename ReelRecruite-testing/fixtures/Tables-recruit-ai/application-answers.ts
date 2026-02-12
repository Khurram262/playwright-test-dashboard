import { relations } from "drizzle-orm";
import { pgTable, uuid, text, jsonb, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { applications } from "./applications";
import { jobQuestions } from "./job-questions";

export const applicationAnswers = pgTable(
  "application_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    jobQuestionId: uuid("job_question_id")
      .notNull()
      .references(() => jobQuestions.id),

    // Answer Data
    answer: text("answer"), // For text, textarea, number, url, boolean
    answerJson: jsonb("answer_json"), // For multiple-choice (array of selected options)

    // Auto-scoring (for future)
    isCorrect: boolean("is_correct"), // Based on expectedAnswer matching
  },
  (t) => ({
    applicationIdIdx: index("application_answers_application_id_idx").on(t.applicationId),
    jobQuestionIdIdx: index("application_answers_job_question_id_idx").on(t.jobQuestionId),
    applicationQuestionUniqueIdx: uniqueIndex("application_answers_application_question_idx").on(t.applicationId, t.jobQuestionId),
  }),
);

export const applicationAnswersRelations = relations(applicationAnswers, ({ one }) => ({
  application: one(applications, {
    fields: [applicationAnswers.applicationId],
    references: [applications.id],
  }),
  jobQuestion: one(jobQuestions, {
    fields: [applicationAnswers.jobQuestionId],
    references: [jobQuestions.id],
  }),
}));
