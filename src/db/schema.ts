import { relations } from "drizzle-orm";
import {
  date,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const priorityEnum = pgEnum("priority", ["low", "med", "high"]);
export const statusEnum = pgEnum("status", ["open", "done"]);

export const todos = pgTable("todos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
  dueData: date("due_date"),
  priority: priorityEnum("priority").notNull().default("med"),
  status: statusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tags = pgTable(
  "tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull(), // 後でFKを張る
    name: text("name").notNull(),
  },
  // 同じユーザーが同じタグを2つ重複して作れない制約
  (t) => [uniqueIndex("tags_user_id_name_unique").on(t.userId, t.name)],
);

export const todosToTags = pgTable(
  "todos_to_tags",
  {
    todoId: text("todo_id")
      .notNull()
      .references(() => todos.id, {
        onDelete: "cascade",
      }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  // 複合主キー
  // 同じtodoに同じタグを二重に付けることを防ぐ
  (t) => [primaryKey({ columns: [t.todoId, t.tagId] })],
);

// リレーション宣言
// `relations()` はSQLを一切生成しません。`db.query.todos.findMany({ with: { todosToTags: true } })` のようなリレーショナルクエリを使うときに「どう JOIN すればいいか」をDrizzleに教えるための宣言です。
export const todosRelations = relations(todos, ({ many }) => ({
  todosToTags: many(todosToTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  todosToTags: many(todosToTags),
}));

export const todosToTagsRelations = relations(todosToTags, ({ one }) => ({
  todo: one(todos, {
    fields: [todosToTags.todoId],
    references: [todos.id],
  }),
  tag: one(tags, {
    fields: [todosToTags.tagId],
    references: [tags.id],
  }),
}));
