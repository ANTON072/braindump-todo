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
  });

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <TodoForm />
      <ul className="space-y-2">
        {todoRows.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </main>
  );
}
