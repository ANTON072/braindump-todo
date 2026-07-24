"use client";

import {
  getFormProps,
  getInputProps,
  getSelectProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTodo } from "./actions";
import { todoSchema } from "./shema";

export function TodoForm() {
  // 第二引数はstateの初期値
  const [lastResult, action] = useActionState(createTodo, undefined);
  const [form, fields] = useForm({
    lastResult,
    defaultValue: { priority: "med" },
    onValidate({ formData }) {
      // クライアント側でもバリデーションを実行
      return parseWithZod(formData, { schema: todoSchema });
    },
    // フィールドがフォーカスから外れたら実行する
    shouldValidate: "onBlur",
  });

  return (
    <form {...getFormProps(form)} action={action} className="space-y-3">
      <Input
        {...getInputProps(fields.title, { type: "text" })}
        placeholder="やること"
      />
      <p className="text-sm text-red-600">{fields.title.errors}</p>
      <Textarea
        {...getTextareaProps(fields.notes)}
        placeholder="メモ（任意）"
      />
      <Input {...getInputProps(fields.dueData, { type: "date" })} />
      <select
        {...getSelectProps(fields.priority)}
        className="border rounded p-2 w-full"
      >
        <option value="low">低</option>
        <option value="med">中</option>
        <option value="high">高</option>
      </select>
      <Button type="submit">追加</Button>
    </form>
  );
}
