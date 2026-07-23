// Better Authのすべての認証エンドポイントをまとめて受け取るキャッチオールルート
// Next.jsでBetter Authを利用するためのアダプター層
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Better AuthのauthインスタンスをNext.jsのRoute Handler形式に変換する
export const { GET, POST } = toNextJsHandler(auth);
