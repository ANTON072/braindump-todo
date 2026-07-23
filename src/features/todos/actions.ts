"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { todoSchema } from "./shema";

export async function createTodo(prevState: unknown, formData: FormData) {
  const userId = await requireUserId();

  // server actionでconformのメソッドを利用する
  const submission = parseWithZod(formData, { schema: todoSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }

  await db.insert(todos).values({ ...submission.value, userId });
  // Next.jsのキャッシュを破棄して/todosページを再取得。
  // insertした内容が画面に反映される
  revalidatePath("/todos");
  return submission.reply({ resetForm: true });
}
