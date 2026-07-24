import { z } from "zod";

export const todoSchema = z.object({
  title: z.string({ error: "タイトルは必須です" }).max(200),
  notes: z.string().max(2000).optional(),
  dueData: z.string().date().optional(),
  priority: z.enum(["low", "med", "high"]).default("med"),
  tagsInput: z.string().max(500).optional(),
});
