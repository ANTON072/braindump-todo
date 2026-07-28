"use client";

import { useActionState } from "react";
import { deleteTodo } from "./actions";

export function DeleteButton({ todoId }: { todoId: string }) {
  const [state, action] = useActionState(deleteTodo, { ok: true } as const);

  return (
    <form action={action.bind(null, todoId)}>
      {" "}
      <button type="submit" className="text-sm text-gray-500">
        削除
      </button>
      {!state.ok && <p className="text-xs text-red-600">{state.message}</p>}
    </form>
  );
}
