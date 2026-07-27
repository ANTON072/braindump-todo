// DBクライアント
// アプリ全体で使うDB接続のシングルトン定義
// ランタイム用
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Resource } from "sst";
import * as authSchema from "./auth-schema";
import * as schema from "./schema";

function buildConnectionConfig() {
  if (process.env.TEST_DATABASE_URL) {
    return { connectionString: process.env.TEST_DATABASE_URL };
  }
  if (process.env.DATABASE_URL) {
    const isLocal =
      process.env.DATABASE_URL.includes("localhost") ||
      process.env.DATABASE_URL.includes("127.0.0.1");
    return {
      connectionString: process.env.DATABASE_URL,
      // ローカルDocker以外（Aurora経由）はSSL必須だが自己署名証明書のため検証を無効化
      ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
    };
  }
  // SST環境ではlinkされたAuroraから取る
  return {
    host: Resource.Database.host,
    port: Resource.Database.port,
    user: Resource.Database.username,
    password: Resource.Database.password,
    database: Resource.Database.database,
    ssl: { rejectUnauthorized: false },
  };
}

const pool = new Pool({ ...buildConnectionConfig(), max: 1 });

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...authSchema,
  },
});
