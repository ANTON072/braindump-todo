import { z } from "zod";

export const extractedTaskSchema = z.object({
  title: z.string().min(1),
  dueDate: z.string().nullable(),
  priority: z.enum(["low", "med", "high"]).nullable(),
  tags: z.array(z.string()),
});

export const extractionResultSchema = z.object({
  tasks: z.array(extractedTaskSchema),
});

export type ExtractedTask = z.infer<typeof extractedTaskSchema>;

export const braindumpFormSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string({ error: "タイトルは必須です" }).max(200),
        dueDate: z.iso.date().optional(),
        priority: z.enum(["low", "med", "high"]).default("med"),
        tagsInput: z.string().max(500).optional(),
      }),
    )
    .min(1, "タスクが1件もありません"),
});
