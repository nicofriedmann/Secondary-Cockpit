import { z } from "zod/v4"

export const teamMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  title: z.string().min(1, "Job title is required"),
  role: z.enum(["individual_contributor", "lead", "manager", "director", "vp"]),
  departmentId: z.string().min(1, "Department is required"),
  managerId: z.string().nullable().optional(),
  phone: z.string().optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
})

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>
