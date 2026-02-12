import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, boolean, integer, date, timestamp, text, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

export const candidateProfiles = pgTable(
  "candidate_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    // Experience & Skills
    yearsOfExperience: integer("years_of_experience"),
    skills: text("skills").array(),

    // Documents
    resumeUrl: varchar("resume_url", { length: 1000 }),
    portfolioUrl: varchar("portfolio_url", { length: 500 }),
    coverVideo: varchar("cover_video", { length: 1000 }),

    // Preferences
    salaryExpectation: varchar("salary_expectation", { length: 255 }),
    preferredLocations: text("preferred_locations").array(),
    preferredJobTypes: text("preferred_job_types").array(),
    preferredWorkTypes: text("preferred_work_types").array(),
    willingToRelocate: boolean("willing_to_relocate").default(false).notNull(),

    // Availability
    isActivelyLooking: boolean("is_actively_looking").default(true).notNull(),
    availableFrom: date("available_from"),
    noticePeriod: varchar("notice_period", { length: 100 }),

    // Social/Professional Links
    linkedinUrl: varchar("linkedin_url", { length: 500 }),
    githubUrl: varchar("github_url", { length: 500 }),
    portfolioWebsite: varchar("portfolio_website", { length: 500 }),

    // Education & Experience (JSONB for flexibility)
    education: jsonb("education"),
    workExperience: jsonb("work_experience"),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: uniqueIndex("candidate_profiles_user_id_idx").on(t.userId),
    isActivelyLookingIdx: index("candidate_profiles_is_actively_looking_idx").on(t.isActivelyLooking),
  }),
);

export const candidateProfilesRelations = relations(candidateProfiles, ({ one }) => ({
  user: one(users, {
    fields: [candidateProfiles.userId],
    references: [users.id],
  }),
}));
