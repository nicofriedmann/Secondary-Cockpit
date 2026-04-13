import { z } from "zod/v4"

export const checkInSchema = z.object({
  teamMemberId: z.string().min(1, "Team member is required"),
  type: z.enum(["weekly", "monthly", "ad_hoc"]),
  wins: z.string().optional(),
  challenges: z.string().optional(),
  nextSteps: z.string().optional(),
  notes: z.string().optional(),
  actionItems: z.array(z.object({
    description: z.string().min(1),
    dueDate: z.string().nullable().optional(),
  })).optional(),
})

export type CheckInFormData = z.infer<typeof checkInSchema>
