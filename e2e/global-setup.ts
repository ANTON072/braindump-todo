import { sql } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/lib/auth";

export const TEST_USER = {
  name: "E2E",
  email: "e2e@example.com",
  password: "e2e-password-123",
};

export default async function globalSetup() {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error(
      "TEST_DATABASE_URLが未設定です。E2Eはテスト用DBでのみ実行してください",
    );
  }

  await db.execute(
    sql`TRUNCATE TABLE "user", todos, tags, todos_to_tags RESTART IDENTITY CASCADE`,
  );

  const res = await auth.api.signUpEmail({ body: TEST_USER, asResponse: true });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(`テストユーザー作成失敗: ${JSON.stringify(body)}`);
  }
}
