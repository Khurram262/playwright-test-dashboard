import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, boolean, integer, timestamp, text, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { jobs } from "./jobs";

export const companyProfiles = pgTable(
  "company_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    // Company Identity
    companyName: varchar("company_name", { length: 255 }).notNull(),
    companySlug: varchar("company_slug", { length: 255 }).unique(),

    // Verification & Status
    isVerified: boolean("is_verified").default(false).notNull(),
    verificationDocument: varchar("verification_document", { length: 500 }),

    // Company Details
    industry: varchar("industry", { length: 255 }),
    companySize: varchar("company_size", { length: 100 }),
    foundedYear: integer("founded_year"),
    website: varchar("website", { length: 500 }),

    // Branding
    logoUrl: varchar("logo_url", { length: 500 }),
    bannerUrl: varchar("banner_url", { length: 500 }),
    description: text("description"),
    tagline: varchar("tagline", { length: 255 }),

    // Location
    headquarters: varchar("headquarters", { length: 255 }),
    locations: text("locations").array(),

    // Social Links
    linkedinUrl: varchar("linkedin_url", { length: 500 }),
    twitterUrl: varchar("twitter_url", { length: 500 }),
    facebookUrl: varchar("facebook_url", { length: 500 }),

    // Contact
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 20 }),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: uniqueIndex("company_profiles_user_id_idx").on(t.userId),
    companyNameIdx: index("company_profiles_company_name_idx").on(t.companyName),
    companySlugIdx: uniqueIndex("company_profiles_company_slug_idx").on(t.companySlug),
    isVerifiedIdx: index("company_profiles_is_verified_idx").on(t.isVerified),
  }),
);

export const companyProfilesRelations = relations(companyProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [companyProfiles.userId],
    references: [users.id],
  }),
  jobs: many(jobs),
}));
