import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, boolean, timestamp, text, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { applications } from "./applications";
import { jobFields } from "./job-fields";
import { jobQuestions } from "./job-questions";
import { companyProfiles } from "./company-profiles";
import { experienceLevelEnum, jobStatusEnum, jobTypeEnum, workTypeEnum, currencyEnum } from "./enums";

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recruiterId: uuid("recruiter_id")
      .notNull()
      .references(() => users.id),
    companyId: uuid("company_id").references(() => companyProfiles.id),

    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    status: jobStatusEnum("status").default("active").notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    title: varchar("title", { length: 255 }),
    highlight: varchar("highlight", { length: 500 }),

    location: varchar("location", { length: 255 }),
    region: varchar("region", { length: 100 }),

    jobType: jobTypeEnum("job_type"),
    workType: workTypeEnum("work_type"),
    experienceLevel: experienceLevelEnum("experience_level"),
    salaryRange: varchar("salary_range", { length: 255 }),
    currency: currencyEnum("currency"),

    description: text("description"),
    requiredSkills: text("required_skills").array(),
    requirements: text("requirements").array(),
    tags: text("tags").array(),

    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    recruiterIdIdx: index("jobs_recruiter_id_idx").on(t.recruiterId),
    companyIdIdx: index("jobs_company_id_idx").on(t.companyId),
    statusIdx: index("jobs_status_idx").on(t.status),
    isDeletedIdx: index("jobs_is_deleted_idx").on(t.isDeleted),
    regionIdx: index("jobs_region_idx").on(t.region),
    experienceLevelIdx: index("jobs_experience_level_idx").on(t.experienceLevel),
    createdAtIdx: index("jobs_created_at_idx").on(t.createdAt),
    statusRegionIdx: index("jobs_status_region_idx").on(t.status, t.region),
  }),
);

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  recruiter: one(users, {
    fields: [jobs.recruiterId],
    references: [users.id],
    relationName: "userJobs",
  }),
  company: one(companyProfiles, {
    fields: [jobs.companyId],
    references: [companyProfiles.id],
  }),
  applications: many(applications),
  fields: many(jobFields),
  questions: many(jobQuestions),
}));
