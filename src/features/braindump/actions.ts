"use server";

import { requireUserId } from "@/lib/session";
import { extractTasksFromBraindump } from "./extract-task";

export async function runBraindumpExtraction(rawText: string) {
  await requireUserId();
  if (rawText.trim().length === 0 || rawText.length > 4000) {
    throw new Error("テキストは1〜4000文字で入力してください");
  }
  return extractTasksFromBraindump(rawText);
}
