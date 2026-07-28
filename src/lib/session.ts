import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { log } from "./logger";

export async function requireUserId(): Promise<string> {
  let session;
  try {
    // リクエストヘッダを渡してCookieを取得
    session = await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    log("error", "getSession failed", { error: String(error) });
    throw error;
  }
  if (!session) redirect("/login");
  return session.user.id;
}
