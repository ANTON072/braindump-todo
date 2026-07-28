// 一時的な接続エラー/タイムアウトだけを対象に、短い待機を挟んで数回だけ再試行する
export async function withRetry<T>(
  operation: () => Promise<T>,
  { retries = 2, delayMs = 1500 } = {},
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransient(error) || attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

function isTransient(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  // 接続まわりの一時エラーのみ（論理エラーは即失敗させる）
  return code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "57P01";
}
