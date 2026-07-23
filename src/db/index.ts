// DBクライアント
// アプリ全体で使うDB接続のシングルトン定義
// ランタイム用
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "./auth-schema";
import * as schema from "./schema";

const connectionString =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) throw new Error("DATABASE_URL is not set");

const pool = new Pool({ connectionString });

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...authSchema,
  },
});
