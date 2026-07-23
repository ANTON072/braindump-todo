import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.test" });

export default defineConfig({
  schema: "./src/db/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.TEST_DATABASE_URL! },
});
