import { pgTable, uuid, varchar, timestamp, text, boolean, index, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { subscriptionPlanEnum, subscriptionStatusEnum } from "./enums";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    // Stripe IDs
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull(),
    stripePaymentMethodId: varchar("stripe_payment_method_id", { length: 255 }),
    
    // Subscription details
    plan: subscriptionPlanEnum("plan").notNull(),
    status: subscriptionStatusEnum("status").notNull().default("incomplete"),
    
    // Pricing
    amount: integer("amount").notNull(), // Amount in cents (e.g., 500 for $5.00)
    currency: varchar("currency", { length: 10 }).notNull().default("usd"),
    
    // Dates
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    canceledAt: timestamp("canceled_at"),
    
    // Trial
    trialStart: timestamp("trial_start"),
    trialEnd: timestamp("trial_end"),
    
    // Metadata
    metadata: text("metadata"), // JSON string for additional data
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("subscriptions_user_id_idx").on(t.userId),
    stripeCustomerIdIdx: index("subscriptions_stripe_customer_id_idx").on(t.stripeCustomerId),
    stripeSubscriptionIdIdx: index("subscriptions_stripe_subscription_id_idx").on(t.stripeSubscriptionId),
  }),
);

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

