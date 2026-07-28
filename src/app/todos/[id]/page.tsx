import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { requireUserId } from "@/lib/session";

const priorityLabel = { low: "低", med: "中", high: "高" } as const;
const priorityVariant = {
  low: "secondary",
  med: "default",
  high: "destructive",
} as const;

export default async function TodoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const todo = await db.query.todos.findFirst({
    where: and(eq(todos.id, id), eq(todos.userId, userId)),
    with: { todosToTags: { with: { tag: true } } },
  });

  if (!todo) notFound();

  const tags = todo.todosToTags.map((link) => link.tag);

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Link href="/todos" className="text-sm text-blue-600 underline">
        ← 一覧に戻る
      </Link>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <h1
            className={`text-xl font-bold ${todo.status === "done" ? "line-through text-muted-foreground" : ""}`}
          >
            {todo.title}
          </h1>
          <Badge variant={priorityVariant[todo.priority]}>
            {priorityLabel[todo.priority]}
          </Badge>
        </div>

        {todo.notes && (
          <p className="text-sm text-muted-foreground">{todo.notes}</p>
        )}

        <dl className="space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">状態</dt>
            <dd>{todo.status === "done" ? "完了" : "未完了"}</dd>
          </div>
          {todo.dueData && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground">期限</dt>
              <dd>{todo.dueData}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="text-muted-foreground">作成日</dt>
            <dd>{todo.createdAt.toLocaleDateString("ja-JP")}</dd>
          </div>
        </dl>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
