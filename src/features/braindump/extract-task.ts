import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { Resource } from "sst";
import { type ExtractedTask, extractionResultSchema } from "./schema";

function resolveOpenAiApiKey(): string {
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  return Resource.OpenaiApiKey.value;
}

const client = new OpenAI({ apiKey: resolveOpenAiApiKey() });

const SYSTEM_PROMPT = `あなたはタスク抽出アシスタントです。
ユーザーが雑に書き出したテキストから、実行可能なタスクを抽出してください。
- title は簡潔な命令形にする
- 期日が読み取れる場合のみ dueDate に YYYY-MM-DD で入れる（今日は {today}）
- 緊急度が読み取れる場合のみ priority を設定する
- 内容を分類する日本語タグを 0〜3 個付ける（例: 買い物, 仕事, 家庭）
- タスクでないもの（感想・メモ）は含めない`;

export async function extractTasksFromBraindump(
  rawText: string,
): Promise<ExtractedTask[]> {
  const today = new Date().toISOString().slice(0, 10);

  const response = await client.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: SYSTEM_PROMPT.replace("{today}", today) },
      { role: "user", content: rawText },
    ],
    // ZodスキーマをOpenAIが要求するJSON Schemaに変換して送信
    text: { format: zodTextFormat(extractionResultSchema, "extraction") },
  });

  // Zodでレスポンスを再検証する
  const verified = extractionResultSchema.safeParse(response.output_parsed);
  if (!verified.success) {
    throw new Error("抽出結果がスキーマに一致しませんでした");
  }
  return verified.data.tasks;
}
