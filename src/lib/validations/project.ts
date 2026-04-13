import { z } from "zod/v4"

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
})

export const milestoneSchema = z.object({
  name: z.string().min(1, "Milestone name is required"),
  description: z.string().optional(),
  projectId: z.string().min(1),
  dueDate: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export type ProjectFormData = z.infer<typeof projectSchema>
export type MilestoneFormData = z.infer<typeof milestoneSchema>
