import { pgTable, uuid, varchar, boolean, integer, date, timestamp, pgEnum, uniqueIndex, index, text } from "drizzle-orm/pg-core";
import { roles } from "./roles";
import { eq, relations } from "drizzle-orm";
import { reels } from "./reels";
import { jobs } from "./jobs";
import { applications } from "./applications";
import { messages } from "./messages";
import { chats } from "./chats";
import { likes } from "./likes";
import { acls } from "./acls";
import { candidateProfiles } from "./candidate-profiles";
import { companyProfiles } from "./company-profiles";
import { socialProviderEnum, userTypeEnum } from "./enums";
import { notifications } from "./notifications";
import { userPreferences } from "./user-preferences";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    userType: userTypeEnum("user_type").notNull(),

    // Basic Info
    title: varchar("title", { length: 255 }),
    bio: text("bio"),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    coverUrl: varchar("cover_url", { length: 500 }),
    location: varchar("location", { length: 255 }),

    // Contact
    phone: varchar("phone", { length: 20 }),
    dateOfBirth: date("date_of_birth"),
    gender: varchar("gender", { length: 50 }),
    country: varchar("country", { length: 100 }),
    timeZone: varchar("time_zone", { length: 100 }),

    // Auth & Security
    socialProvider: socialProviderEnum("social_provider"),
    socialId: varchar("social_id", { length: 255 }),
    socialProfileData: varchar("social_profile_data", { length: 2000 }),
    otp: integer("otp"),
    otpExpiry: timestamp("otp_expiry"),
    emailVerified: boolean("email_verified").default(false).notNull(),
    phoneVerified: boolean("phone_verified").default(false).notNull(),

    // Profile & Activity
    profileComplete: boolean("profile_complete").default(true).notNull(),
    status: varchar("status", { length: 100 }),
    lastReelRefresh: timestamp("last_reel_refresh"),

    // Approval Status (for recruiters)
    isApproved: boolean("is_approved").default(false).notNull(),
    rejectionReason: text("rejection_reason"),

    // Role & Permissions
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    roleIdIdx: index("users_role_id_idx").on(t.roleId),
    userTypeIdx: index("users_user_type_idx").on(t.userType),
    socialIdIdx: index("users_social_id_idx").on(t.socialId),
  }),
);

export const userRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  candidateProfile: one(candidateProfiles, {
    fields: [users.id],
    references: [candidateProfiles.userId],
  }),
  companyProfile: one(companyProfiles, {
    fields: [users.id],
    references: [companyProfiles.userId],
  }),
  reels: many(reels),
  jobs: many(jobs, {
    relationName: "userJobs",
  }),
  sentMessages: many(messages, {
    relationName: "sentMessages",
  }),
  recruiterChats: many(chats, {
    relationName: "recruiterChats",
  }),
  candidateChats: many(chats, {
    relationName: "candidateChats",
  }),
  applications: many(applications, {
    relationName: "userApplications",
  }),
  likes: many(likes),
  acls: many(acls),
  notifications: many(notifications),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
}));
