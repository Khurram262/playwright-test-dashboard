import { pgEnum } from "drizzle-orm/pg-core";

export const aclTypeEnum = pgEnum("acl_type", ["email", "phone", "ip", "first_name", "last_name", "tokens"]);

export const applicationStatusEnum = pgEnum("application_status", ["pending", "screening", "shortlisted", "interview", "rejected", "hired", "offer-sent", "withdrawn"]);

export const jobStatusEnum = pgEnum("job_status", ["draft", "active", "closed", "expired"]);
export const jobTypeEnum = pgEnum("job_type", ["full-time", "part-time", "contract", "internship"]);
export const workTypeEnum = pgEnum("work_type", ["remote", "on-site", "hybrid"]);
export const experienceLevelEnum = pgEnum("experience_level", ["entry", "mid", "senior", "executive"]);

export const settingTypeEnum = pgEnum("setting_type", ["string", "number", "boolean"]);

export const contentTypeEnum = pgEnum("content_type", ["reel", "job", "message", "profile"]);
export const reportStatusEnum = pgEnum("report_status", ["pending", "reviewed", "resolved", "dismissed"]);

export const userTypeEnum = pgEnum("user_type", ["candidate", "recruiter"]);
export const socialProviderEnum = pgEnum("social_provider", ["google", "linkedin", "github"]);

export const currencyEnum = pgEnum("currency", ["pkr", "usd"]);

// Dynamic form field types
export const fieldTypeEnum = pgEnum("field_type", [
  "text",
  "textarea",
  "number",
  "email",
  "url",
  "phone",
  "date",
  "file",
  "multi-file",
  "boolean",
  "select",
  "multi-select",
  "radio",
  "checkbox",
  "video",
]);

// Screening question types
export const questionTypeEnum = pgEnum("question_type", ["text", "textarea", "single-choice", "multiple-choice", "boolean", "number", "url", "video"]);

// Notifications
export const notificationTypeEnum = pgEnum("notification_type", ["info", "warn", "error"]);
export const notificationStatusEnum = pgEnum("notification_status", ["read", "un-read", "archived"]);

// Chat
export const chatStatusEnum = pgEnum("chat_status", ["active", "archived"]);

// Subscriptions
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["basic", "silver", "gold"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due", "unpaid", "trialing", "incomplete", "incomplete_expired", "paused"]);
