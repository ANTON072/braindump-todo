"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { deleteTodoForUser, toggleTodoStatusForUser } from "./service";
import { todoSchema } from "./shema";

export async function createTodo(prevState: unknown, formData: FormData) {
  const userId = await requireUserId();

  const submission = parseWithZod(formData, { schema: todoSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }

  await db.insert(todos).values({ ...submission.value, userId });
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
