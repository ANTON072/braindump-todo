"use client";

import {
  getFormProps,
  getInputProps,
  getSelectProps,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useActionState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveBraindumpTasks } from "./actions";
import { braindumpFormSchema } from "./schema";

// 初期値の型は厳密にチェックしない。ただ通過させるだけ。
export function BraindumpForm({ defaultValue }: { defaultValue: unknown }) {
  const [lastResult, action] = useActionState(saveBraindumpTasks, undefined);
  const [form, fields] = useForm<z.infer<typeof braindumpFormSchema>>({
    lastResult,
    // biome-ignore lint/suspicious/noExplicitAny: ConformのdefaultValue型が複雑でキャストが必要
    defaultValue: defaultValue as any,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: braindumpFormSchema });
    },
  });

  // 1行づつ操作できるリストに変換する
  const taskFields = fields.tasks.getFieldList();

  return (
    <form {...getFormProps(form)} action={action} className="space-y-4">
      {taskFields.map((taskField, index) => {
        const task = taskField.getFieldset();
        return (
          <div
            key={taskField.key}
            className="flex items-start gap-2 rounded border p-3"
          >
            <div className="flex-1 space-y-2">
              <Input {...getInputProps(task.title, { type: "text" })} />
              <p className="text-sm text-red-600">{task.title.errors}</p>
              <div className="flex gap-2">
                <Input {...getInputProps(task.dueDate, { type: "date" })} />
                <select
                  {...getSelectProps(task.priority)}
                  className="rounded border p-2"
                >
                  <option value="low">低</option>
                  <option value="med">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              <Input
                {...getInputProps(task.tagsInput, { type: "text" })}
                placeholder="タグ（カンマ区切り）"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              {...form.remove.getButtonProps({
                name: fields.tasks.name,
                index,
              })}
            >
              削除
            </Button>
          </div>
        );
      })}

      <div className="flex gap-2">
        {/* Enter キーの暗黙送信は DOM 上で最初の submit に飛ぶため、保存を先に置く */}
        <Button type="submit">すべて保存</Button>
        <Button
          variant="outline"
          type="submit"
          {...form.insert.getButtonProps({ name: fields.tasks.name })}
        >
          ＋ 行を追加
        </Button>
      </div>
      <p className="text-sm text-red-600">{fields.tasks.errors}</p>
    </form>
  );
}
