import "dotenv/config";

// drizzle-kit generateやmigrateなどのコマンドを実行するときに参照される設定ファイル
// スキーマ定義（`src/db/schema.ts`）の変更をSQLマイグレーションファイルに変換して、実際のDBに適用するフローを制御
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/db/schema.ts", "./src/db/auth-schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
