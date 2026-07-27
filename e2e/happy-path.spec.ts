import { expect, test } from "@playwright/test";
import { TEST_USER } from "./global-setup";

test("ログイン→タグ付き作成→完了切替→削除→ログアウト", async ({ page }) => {
  // 1.ログイン
  await page.goto("/login");
  await page.getByPlaceholder("メールアドレス").fill(TEST_USER.email);
  await page.getByPlaceholder("パスワード").fill(TEST_USER.password);
  await page.getByRole("button", { name: "ログイン" }).click();
  await page.waitForURL("/todos");

  // 2.タグ付き作成
  await page.getByPlaceholder("やること").fill("歯医者に電話");
  await page.getByPlaceholder(/タグ/).fill("健康");
  await page.getByRole("button", { name: "追加" }).click();

  await expect(page.getByText("歯医者に電話")).toBeVisible();
  await expect(page.getByText("健康")).toBeVisible();

  // 3. 完了切替
  await page.getByRole("button", { name: "完了" }).first().click();

  // 4. 削除
  await page.getByRole("button", { name: "削除" }).first().click();
  await expect(page.getByText("歯医者に電話")).toHaveCount(0);

  // 5. ログアウト
  await page.getByRole("button", { name: "ログアウト" }).click();
  await page.waitForURL("/login");
});

test("未認証で/todosに触れるとログインへ飛ばされる", async ({ page }) => {
  await page.goto("/todos");
  await expect(page).toHaveURL(/\/login/);
});
