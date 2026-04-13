import { z } from "zod/v4"

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "done", "blocked"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  departmentId: z.string().min(1, "Department is required"),
  taskCategoryId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
})

export type TaskFormData = z.infer<typeof taskSchema>
