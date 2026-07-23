import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    // 本番は招待制
    disableSignUp: process.env.BETTER_AUTH_DISABLE_SIGNUP !== "false",
  },
});
