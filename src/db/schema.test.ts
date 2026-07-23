import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "@/db";
import { seedUser } from "@/test/seed";
import { tags } from "./schema";

describe("テストハーネスの疎通", () => {
  it("insertしたタグをselectし直せる", async () => {
    const userId = await seedUser("smoke@example.com");
    // INSERT INTO tags (user_id, name) VALUES ('...', '買い物');
    await db.insert(tags).values({ userId, name: "買い物" });
    const rows = await db
      .select()
      .from(tags)
      .where(and(eq(tags.userId, userId), eq(tags.name, "買い物")));

    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("買い物");
  });
});
