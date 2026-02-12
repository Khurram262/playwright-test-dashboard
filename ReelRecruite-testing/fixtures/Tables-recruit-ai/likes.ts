import { relations } from "drizzle-orm";
import { pgTable, uuid, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { reels } from "./reels";

export const likes = pgTable(
  "likes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    reelId: uuid("reel_id")
      .notNull()
      .references(() => reels.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("likes_user_id_idx").on(t.userId),
    reelIdIdx: index("likes_reel_id_idx").on(t.reelId),
    userReelIdx: uniqueIndex("likes_user_reel_idx").on(t.userId, t.reelId),
  }),
);

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  reel: one(reels, {
    fields: [likes.reelId],
    references: [reels.id],
  }),
}));
