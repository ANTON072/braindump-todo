"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { attachTagsToTodo, normalizeTagNames } from "../tags/upsert-tags";
import { extractTasksFromBraindump } from "./extract-task";
import { braindumpFormSchema } from "./schema";

export async function runBraindumpExtraction(rawText: string) {
  await requireUserId();
  if (rawText.trim().length === 0 || rawText.length > 4000) {
    throw new Error("テキストは1〜4000文字で入力してください");
  }
  return extractTasksFromBraindump(rawText);
}

export async function saveBraindumpTasks(
  prevState: unknown,
  formData: FormData,
) {
  const userId = await requireUserId();

  const submission = parseWithZod(formData, { schema: braindumpFormSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }

  await db.transaction(async (tx) => {
    for (const task of submission.value.tasks) {
      const { tagsInput, ...todoValues } = task;
      const [todo] = await tx
        .insert(todos)
        .values({ ...todoValues, userId })
        .returning();
      await attachTagsToTodo(
        tx,
        userId,
        todo.id,
        normalizeTagNames(tagsInput ?? ""),
      );
    }
  });

  redirect("/todos");
}
