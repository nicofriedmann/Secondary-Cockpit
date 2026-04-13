export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled"
export type MemberRole = "individual_contributor" | "lead" | "manager" | "director" | "vp"
export type CheckInType = "weekly" | "monthly" | "ad_hoc"
export type ProjectMemberRole = "lead" | "member" | "stakeholder"

export const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: "todo", label: "To Do", color: "bg-slate-100 text-slate-700" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "review", label: "In Review", color: "bg-yellow-100 text-yellow-700" },
  { value: "done", label: "Done", color: "bg-green-100 text-green-700" },
  { value: "blocked", label: "Blocked", color: "bg-red-100 text-red-700" },
]

export const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-600" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-600" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-600" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-600" },
]

export const PROJECT_STATUSES: { value: ProjectStatus; label: string; color: string }[] = [
  { value: "planning", label: "Planning", color: "bg-slate-100 text-slate-700" },
  { value: "active", label: "Active", color: "bg-blue-100 text-blue-700" },
  { value: "on_hold", label: "On Hold", color: "bg-yellow-100 text-yellow-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
]

export const MEMBER_ROLES: { value: MemberRole; label: string }[] = [
  { value: "individual_contributor", label: "Individual Contributor" },
  { value: "lead", label: "Team Lead" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "vp", label: "Vice President" },
]
