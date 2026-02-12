import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, boolean, integer, timestamp, text, jsonb, index } from "drizzle-orm/pg-core";
import { jobs } from "./jobs";
import { applicationFields } from "./application-fields";
import { fieldTypeEnum } from "./enums";

export const jobFields = pgTable(
  "job_fields",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),

    // Field Definition
    label: varchar("label", { length: 255 }).notNull(),
    fieldKey: varchar("field_key", { length: 100 }).notNull(),
    type: fieldTypeEnum("type").notNull(),

    // Validation & Options
    isRequired: boolean("is_required").default(false).notNull(),
    placeholder: varchar("placeholder", { length: 255 }),
    options: jsonb("options"), // For select/multi-select/radio/checkbox
    validationRules: jsonb("validation_rules"), // {min, max, pattern, etc.}

    // Presentation
    orderIndex: integer("order_index").notNull(),
    helpText: text("help_text"),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    jobIdIdx: index("job_fields_job_id_idx").on(t.jobId),
    jobIdOrderIdx: index("job_fields_job_id_order_idx").on(t.jobId, t.orderIndex),
  }),
);

export const jobFieldsRelations = relations(jobFields, ({ one, many }) => ({
  job: one(jobs, {
    fields: [jobFields.jobId],
    references: [jobs.id],
  }),
  applicationFields: many(applicationFields),
}));
