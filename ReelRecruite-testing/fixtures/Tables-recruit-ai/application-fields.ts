import { relations } from "drizzle-orm";
import { pgTable, uuid, text, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { applications } from "./applications";
import { jobFields } from "./job-fields";

export const applicationFields = pgTable(
  "application_fields",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    jobFieldId: uuid("job_field_id")
      .notNull()
      .references(() => jobFields.id),

    // Response Data
    value: text("value"), // For simple text, number, url, etc.
    valueJson: jsonb("value_json"), // For complex/multi-value fields (multi-select, etc.)
  },
  (t) => ({
    applicationIdIdx: index("application_fields_application_id_idx").on(t.applicationId),
    jobFieldIdIdx: index("application_fields_job_field_id_idx").on(t.jobFieldId),
    applicationFieldUniqueIdx: uniqueIndex("application_fields_application_job_field_idx").on(t.applicationId, t.jobFieldId),
  }),
);

export const applicationFieldsRelations = relations(applicationFields, ({ one }) => ({
  application: one(applications, {
    fields: [applicationFields.applicationId],
    references: [applications.id],
  }),
  jobField: one(jobFields, {
    fields: [applicationFields.jobFieldId],
    references: [jobFields.id],
  }),
}));
