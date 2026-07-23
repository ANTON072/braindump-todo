import { sql } from "drizzle-orm";
import { beforeEach } from "vitest";
import { db } from "@/db";

if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    "TEST_DATABASE_URLが未設定です。テストはテスト用DBのみで実行してください",
  );
}

beforeEach(async () => {
  // 外部キーで参照しているテーブルも含めて全部消す
  // オートインクリメントもリセットする
  // userはPostgreSQLの予約語なのでダブルクォートしている
  await db.execute(
    sql`TRUNCATE TABLE "user", todos, tags, todos_to_tags RESTART IDENTITY CASCADE`,
  );
});
