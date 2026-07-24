import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db";
import { tags, todosToTags } from "@/db/schema";
import { seedUser } from "@/test/seed";
import { createTodoForUser, deleteTodoForUser } from "./service";

let userA: string;
let userB: string;

beforeEach(async () => {
  userA = await seedUser("a@example.com");
  userB = await seedUser("b@example.com");
});

describe("タグ upsert (createTodoForUser 経由)", () => {
  it("同名タグを含む2件を作ってもtagsは再利用され行が増えない", async () => {
    await db.transaction((tx) =>
      createTodoForUser(tx, userA, { title: "牛乳", tagsInput: "買い物" }),
    );
    await db.transaction((tx) =>
      createTodoForUser(tx, userA, { title: "卵", tagsInput: "買い物, 仕事" }),
    );

    const tagRows = await db.select().from(tags).where(eq(tags.userId, userA));
    expect(tagRows).toHaveLength(2);
    expect(tagRows.map((t) => t.name).sort()).toEqual(["仕事", "買い物"]);
  });

  it("todoを削除すると中間テーブルは消えるがtags本体は残る(cascade)", async () => {
    const todo = await db.transaction((tx) =>
      createTodoForUser(tx, userA, { title: "牛乳", tagsInput: "買い物" }),
    );

    await deleteTodoForUser(db, userA, todo.id);

    // 中間テーブル
    const links = await db
      .select()
      .from(todosToTags)
      .where(eq(todosToTags.todoId, todo.id));
    expect(links).toHaveLength(0);

    const tagRows = await db.select().from(tags).where(eq(tags.userId, userA));
    expect(tagRows).toHaveLength(1);
  });

  it("別ユーザーは同名タグ「買い物」を独立して持てる（ユニークはuserId込み）", async () => {
    await db.transaction((tx) =>
      createTodoForUser(tx, userA, { title: "Aの牛乳", tagsInput: "買い物" }),
    );
    await db.transaction((tx) =>
      createTodoForUser(tx, userB, { title: "Bの牛乳", tagsInput: "買い物" }),
    );
    const allBuy = await db.select().from(tags).where(eq(tags.name, "買い物"));
    expect(allBuy).toHaveLength(2);
  });

  it("タグ入力が空でもエラーにならず、todoだけ作られる(空配列ガード)", async () => {
    const todo = await db.transaction((tx) =>
      createTodoForUser(tx, userA, { title: "タグなし", tagsInput: "" }),
    );
    expect(todo.title).toBe("タグなし");
    const tagRows = await db.select().from(tags).where(eq(tags.userId, userA));
    expect(tagRows).toHaveLength(0);
  });
});
