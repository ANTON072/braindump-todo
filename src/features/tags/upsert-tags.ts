import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { tags, todosToTags } from "@/db/schema";

// dbに対して、トランザクション中の一時的なハンドルをtxと短縮するのがイディオム
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function normalizeTagNames(raw: string): string[] {
  const names = raw
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter((name) => name.length > 0);
  return [...new Set(names)];
}

export async function attachTagsToTodo(
  tx: Tx,
  userId: string,
  todoId: string,
  tagNames: string[],
) {
  if (tagNames.length === 0) return;

  // 1. あれば衝突スキップ、なければ作成
  await tx
    .insert(tags)
    .values(tagNames.map((name) => ({ userId, name })))
    .onConflictDoNothing();

  // 2. 新規・既存を問わずidを引き直す
  const tagRows = await tx
    .select({ id: tags.id })
    .from(tags)
    .where(and(eq(tags.userId, userId), inArray(tags.name, tagNames)));

  // 3. 中間テーブルに紐づけ
  await tx
    .insert(todosToTags)
    .values(tagRows.map((tag) => ({ todoId, tagId: tag.id })))
    .onConflictDoNothing();
}
