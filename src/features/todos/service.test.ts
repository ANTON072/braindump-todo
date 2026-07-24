import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { seedUser } from "@/test/seed";
import { deleteTodoForUser, toggleTodoStatusForUser } from "./service";

let userA: string;
let userB: string;
let todoOfB: string;

beforeEach(async () => {
  userA = await seedUser("a@example.com");
  userB = await seedUser("b@example.com");
  const [todo] = await db
    .insert(todos)
    .values({ userId: userB, title: "Bのタスク" })
    .returning();
  todoOfB = todo.id;
});

describe("削除の認可", () => {
  it("他人（A）はBのtodoを削除できない", async () => {
    const result = await deleteTodoForUser(db, userA, todoOfB);

    expect(result.deleted).toBe(false);
    // Bのtodoは残っている
    const rows = await db.select().from(todos).where(eq(todos.id, todoOfB));
    expect(rows).toHaveLength(1);
  });

  it("所有者（B）自身は削除ができる", async () => {
    const result = await deleteTodoForUser(db, userB, todoOfB);
    expect(result.deleted).toBe(true);
    const rows = await db.select().from(todos).where(eq(todos.id, todoOfB));
    expect(rows).toHaveLength(0);
  });
});

describe("完了切替の認可", () => {
  it("他人（A）はBのtodoを切り替えられない", async () => {
    const result = await toggleTodoStatusForUser(db, userA, todoOfB);
    expect(result.updated).toBe(false);
    const [row] = await db.select().from(todos).where(eq(todos.id, todoOfB));
    expect(row.status).toBe("open"); // 変わっていない
  });
});

describe("一覧取得の分離", () => {
  it("自分のtodoだけが返り、他人の分は混ざらない", async () => {
    await db.insert(todos).values({ userId: userA, title: "Aのタスク" });

    const listForA = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userA));

    expect(listForA).toHaveLength(1);
    expect(listForA[0].title).toBe("Aのタスク");
    expect(listForA.every((t) => t.userId === userA)).toBe(true);
  });
});
