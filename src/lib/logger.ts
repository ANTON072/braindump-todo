type Level = "info" | "warn" | "error";

export function log(
  level: Level,
  message: string,
  meta: Record<string, unknown> = {},
) {
  const line = JSON.stringify({
    level,
    message,
    time: new Date().toISOString(),
    ...meta,
  });
  (level === "error" ? console.error : console.log)(line);
}
