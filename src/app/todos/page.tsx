import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { TodoForm } from "@/features/todos/todo-form";
import { TodoItem } from "@/features/todos/todo-item";
import { requireUserId } from "@/lib/session";

export default async function TodosPage() {
  const userId = await requireUserId();
  const todoRows = await db.query.todos.findMany({
    where: eq(todos.userId, userId),
    orderBy: [desc(todos.createdAt)],
    // 中間テーブル(todosToTags)も一緒に取得
    with: {
      todosToTags: {
        // さらに中間テーブルからtagsテーブルも辿る
        with: { tag: true },
      },
    },
  });

  // 中間テーブル2段ネストをUI用にフラット化する
  const todosWithTags = todoRows.map((todo) => ({
    ...todo,
    tags: todo.todosToTags.map((link) => link.tag),
  }));

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <TodoForm />
      <ul className="space-y-2">
        {todosWithTags.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </main>
  );
}
