import { pgTable, uuid, varchar, timestamp, text, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { settingTypeEnum } from "./enums";

export const platformSettings = pgTable(
  "platform_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    settingKey: varchar("setting_key", { length: 255 }).notNull().unique(),
    settingValue: text("setting_value").notNull(),
    settingType: settingTypeEnum("setting_type").notNull(),
    description: text("description"),
    updatedBy: uuid("updated_by").references(() => users.id),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    settingKeyIdx: uniqueIndex("platform_settings_key_idx").on(t.settingKey),
  }),
);
