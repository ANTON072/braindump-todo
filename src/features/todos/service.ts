/**
 * サービス層はnext.jsに依存しない
 * next.jsの関数をモックしなくてもよくなる
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { todos } from "@/db/schema";

// dbでもtransactionでも受けられるように型を緩める
// Parametersは関数の引数の型を配列として取り出すユーティリティ型
// db.transactionの第1引数はコールバック関数なので、次はそのコールバックにParametersをかけてtxの型を取り出す、という入れ子構造
// サービス関数がトランザクション内から呼ばれることもあるので、dbだけではなくtxも受け取れるように設計する必要がある
type Database = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function toggleTodoStatusForUser(
  database: Database,
  userId: string,
  todoId: string,
) {
  const todo = await database.query.todos.findFirst({
    where: and(eq(todos.id, todoId), eq(todos.userId, userId)),
  });
  if (!todo) return { updated: false };

  await database
    .update(todos)
    .set({
      status: todo.status === "open" ? "done" : "open",
      updatedAt: new Date(),
    })
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));

  return { updated: true };
}

export async function deleteTodoForUser(
  database: Database,
  userId: string,
  todoId: string,
) {
  const deleted = await database
    .delete(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
    .returning({ id: todos.id });
  return { deleted: deleted.length > 0 };
}
