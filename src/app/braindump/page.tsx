"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { runBraindumpExtraction } from "@/features/braindump/actions";
import type { ExtractedTask } from "@/features/braindump/schema";

const MAX_LENGTH = 4000;

export default function BraindumpPage() {
  const [rawText, setRawText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    setIsExtracting(true);
    setError(null);
    setExtractedTasks(null);
    try {
      const tasks = await runBraindumpExtraction(rawText);
      setExtractedTasks(tasks);
    } catch (e) {
      setError(e instanceof Error ? e.message : "抽出に失敗しました");
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">ブレインダンプ</h1>

      <div className="space-y-2">
        <Textarea
          placeholder="頭の中のことをそのまま貼り付け…「歯医者に電話、牛乳買う、金曜までにレポート、Sam にメール」"
          rows={6}
          maxLength={MAX_LENGTH}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          disabled={isExtracting}
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExtract}
            disabled={isExtracting || rawText.trim().length === 0}
          >
            抽出する
          </Button>
          <span className="text-sm text-muted-foreground">
            {rawText.length} / {MAX_LENGTH} 文字
          </span>
        </div>
        {isExtracting && (
          <p className="text-sm text-muted-foreground">抽出中… ⌛（数秒かかります）</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {extractedTasks !== null && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            {extractedTasks.length} 件のタスクを抽出しました
          </h2>
          {extractedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">タスクが見つかりませんでした。</p>
          ) : (
            <ul className="space-y-2">
              {extractedTasks.map((task, i) => (
                <li key={i} className="rounded border p-3 space-y-1">
                  <p className="font-medium">{task.title}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {task.dueDate && <span>期限: {task.dueDate}</span>}
                    {task.priority && <span>優先度: {task.priority}</span>}
                    {task.tags.length > 0 && <span>タグ: {task.tags.join(", ")}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
