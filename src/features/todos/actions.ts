"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import {
  createTodoForUser,
  deleteTodoForUser,
  toggleTodoStatusForUser,
} from "./service";
import { todoSchema } from "./shema";

export async function createTodo(prevState: unknown, formData: FormData) {
  const userId = await requireUserId();

  const submission = parseWithZod(formData, { schema: todoSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  // todoは作られたのにタグの紐づけだけ失敗した、という半端な状態を許可しないためにトランザクションを実行
  await db.transaction((tx) => createTodoForUser(tx, userId, submission.value));
  revalidatePath("/todos");
  return submission.reply({ resetForm: true });
}

export async function toggleTodoStatus(todoId: string) {
  const userId = await requireUserId();
  await toggleTodoStatusForUser(db, userId, todoId);
  revalidatePath("/todos");
}

export async function deleteTodo(todoId: string) {
  const userId = await requireUserId();
  await deleteTodoForUser(db, userId, todoId);
  revalidatePath("/todos");
}
