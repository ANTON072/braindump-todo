import { defineConfig } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.test" });

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    // CI では毎回新規に起動、ローカルでは起動済みサーバを使い回す
    reuseExistingServer: !process.env.CI,
    env: {
      // dev サーバをテスト DB に向ける（開発 DB を汚さない）
      TEST_DATABASE_URL: process.env.TEST_DATABASE_URL!,
    },
  },
});
