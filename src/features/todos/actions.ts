"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { ActionResult } from "next/dist/shared/lib/app-router-types";
import { db } from "@/db";
import { log } from "@/lib/logger";
import { requireUserId } from "@/lib/session";
import { todoSchema } from "./schema";
import {
  createTodoForUser,
  deleteTodoForUser,
  toggleTodoStatusForUser,
} from "./service";

export async function createTodo(prevState: unknown, formData: FormData) {
  const requestId = crypto.randomUUID();
  const userId = await requireUserId();
  log("info", "createTodo start", { requestId, userId });

  try {
    const submission = parseWithZod(formData, { schema: todoSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // todoは作られたのにタグの紐づけだけ失敗した、という半端な状態を許可しないためにトランザクションを実行
    await db.transaction((tx) =>
      createTodoForUser(tx, userId, submission.value),
    );
    revalidatePath("/todos");
    log("info", "createTodo ok", { requestId, userId });
    return submission.reply({ resetForm: true });
  } catch (error) {
    log("error", "createTodo failed", {
      requestId,
      userId,
      error: String(error),
    });
    throw error;
  }
}

export async function toggleTodoStatus(todoId: string) {
  const userId = await requireUserId();
  await toggleTodoStatusForUser(db, userId, todoId);
  revalidatePath("/todos");
}

export async function deleteTodo(
  prevState: unknown,
  todoId: string,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const { deleted } = await deleteTodoForUser(db, userId, todoId);
  if (!deleted) {
    return { ok: false, message: "削除することはできませんでした" };
  }
  revalidatePath("/todos");
  return { ok: true };
}
