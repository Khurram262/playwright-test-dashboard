import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, integer, timestamp, text, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { applications } from "./applications";
import { likes } from "./likes";

export const reels = pgTable(
  "reels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    videoUrl: varchar("video_url", { length: 500 }).notNull(),
    thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
    publicId: varchar("public_id", { length: 255 }),
    duration: integer("duration"),
    category: varchar("category", { length: 100 }),
    tags: text("tags").array(),
    views: integer("views").default(0),
    likes: integer("likes").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (t) => ({
    userIdIdx: index("reels_user_id_idx").on(t.userId),
    categoryIdx: index("reels_category_idx").on(t.category),
    createdAtIdx: index("reels_created_at_idx").on(t.createdAt),
  }),
);

export const reelsRelations = relations(reels, ({ one, many }) => ({
  user: one(users, {
    fields: [reels.userId],
    references: [users.id],
  }),
  applications: many(applications),
  likedBy: many(likes),
}));
