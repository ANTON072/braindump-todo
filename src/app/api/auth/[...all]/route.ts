// Better Authのすべての認証エンドポイントをまとめて受け取るキャッチオールルート
// Next.jsでBetter Authを利用するためのアダプター層
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { log } from "@/lib/logger";

const handler = toNextJsHandler(auth);

async function withLogging(
  req: Request,
  fn: (req: Request) => Promise<Response>,
): Promise<Response> {
  const url = new URL(req.url);
  log("info", "auth request", { method: req.method, path: url.pathname });
  try {
    const res = await fn(req);
    if (!res.ok) {
      log("error", "auth response error", {
        method: req.method,
        path: url.pathname,
        status: res.status,
      });
    }
    return res;
  } catch (error) {
    log("error", "auth handler threw", {
      method: req.method,
      path: url.pathname,
      error: String(error),
    });
    throw error;
  }
}

export function GET(req: Request) {
  return withLogging(req, handler.GET);
}

export function POST(req: Request) {
  return withLogging(req, handler.POST);
}
