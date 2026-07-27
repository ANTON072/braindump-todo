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
