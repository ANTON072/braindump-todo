"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { attachTagsToTodo, normalizeTagNames } from "../tags/upsert-tags";
import { extractTasksFromBraindump } from "./extract-task";
import { braindumpFormSchema, type ExtractedTask } from "./schema";

type ExtractionResult =
  | { ok: true; tasks: ExtractedTask[] }
  | { ok: false; message: string };

export async function runBraindumpExtraction(
  rawText: string,
): Promise<ExtractionResult> {
  await requireUserId();
  if (rawText.trim().length === 0 || rawText.length > 4000) {
    return { ok: false, message: "テキストは1〜4000文字で入力してください" };
  }
  try {
    return { ok: true, tasks: await extractTasksFromBraindump(rawText) };
  } catch (error) {
    console.error("braindump extraction failed", error);
    return {
      ok: false,
      message: "抽出に失敗しました。少し時間をおいて再度お試しください。",
    };
  }
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
