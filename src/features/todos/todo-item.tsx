import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteTodo, toggleTodoStatus } from "./actions";

type Priority = "low" | "med" | "high";
type Status = "open" | "done";

type Tag = {
  id: string;
  name: string;
};

type Todo = {
  id: string;
  title: string;
  notes: string | null;
  dueData: string | null;
  priority: Priority;
  status: Status;
  createdAt: Date;
  tags: Tag[];
};

const priorityLabel: Record<Priority, string> = {
  low: "低",
  med: "中",
  high: "高",
};

const priorityVariant: Record<
  Priority,
  "secondary" | "default" | "destructive"
> = {
  low: "secondary",
  med: "default",
  high: "destructive",
};

type Props = {
  todo: Todo;
};

export function TodoItem({ todo }: Props) {
  const isDone = todo.status === "done";
  const toggleAction = toggleTodoStatus.bind(null, todo.id);
  const deleteAction = deleteTodo.bind(null, todo.id);

  return (
    <li className="flex items-start gap-3 rounded-lg border p-4">
      <div className="flex-1 space-y-1">
        <p className={isDone ? "line-through text-muted-foreground" : ""}>
          {todo.title}
        </p>
        {todo.notes && (
          <p className="text-sm text-muted-foreground">{todo.notes}</p>
        )}
        {todo.dueData && (
          <p className="text-xs text-muted-foreground">期限: {todo.dueData}</p>
        )}
        {todo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {todo.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant={priorityVariant[todo.priority]}>
          {priorityLabel[todo.priority]}
        </Badge>
        <form action={toggleAction}>
          <Button type="submit" variant="outline" size="sm">
            {isDone ? "未完了に戻す" : "完了"}
          </Button>
        </form>
        <form action={deleteAction}>
          <Button type="submit" variant="destructive" size="sm">
            削除
          </Button>
        </form>
      </div>
    </li>
  );
}
