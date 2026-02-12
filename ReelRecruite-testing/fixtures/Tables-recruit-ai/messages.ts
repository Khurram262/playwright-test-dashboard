import { relations } from "drizzle-orm";
import { pgTable, uuid, boolean, timestamp, text, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { chats } from "./chats";

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chatId: uuid("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    chatIdIdx: index("messages_chat_id_idx").on(t.chatId),
    senderIdIdx: index("messages_sender_id_idx").on(t.senderId),
    createdAtIdx: index("messages_created_at_idx").on(t.createdAt),
    isReadIdx: index("messages_is_read_idx").on(t.isRead),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
}));
