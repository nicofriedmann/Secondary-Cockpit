import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TASK_STATUSES, TASK_PRIORITIES } from "@/types"
import { format } from "date-fns"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TaskActions } from "@/components/tasks/task-actions"

export const dynamic = "force-dynamic"

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [task, departments, members] = await Promise.all([
    prisma.task.findUnique({
      where: { id },
      include: {
        department: { include: { taskCategories: { orderBy: { sortOrder: "asc" } } } },
        taskCategory: true,
        assignee: true,
        createdBy: true,
        project: true,
      },
    }),
    prisma.department.findMany({
      include: { taskCategories: { orderBy: { sortOrder: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.teamMember.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ])

  if (!task) return notFound()

  const statusInfo = TASK_STATUSES.find((s) => s.value === task.status)
  const priorityInfo = TASK_PRIORITIES.find((p) => p.value === task.priority)

  return (
    <div className="space-y-6">
      <Link href="/tasks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            {statusInfo && <Badge className={statusInfo.color}>{statusInfo.label}</Badge>}
            {priorityInfo && <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.department.color || "#6B7280" }} />
              <span className="text-sm text-muted-foreground">{task.department.name}</span>
            </div>
            {task.taskCategory && <span className="text-sm text-muted-foreground">/ {task.taskCategory.name}</span>}
          </div>
        </div>
        <TaskActions task={task} departments={departments} members={members} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Assignee</p>
                {task.assignee ? (
                  <Link href={`/team/${task.assignee.id}`} className="text-sm font-medium hover:underline">
                    {task.assignee.firstName} {task.assignee.lastName}
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                )}
              </div>
              {task.dueDate && (
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium">{format(new Date(task.dueDate), "MMM d, yyyy")}</p>
                </div>
              )}
              {task.project && (
                <div>
                  <p className="text-xs text-muted-foreground">Project</p>
                  <Link href={`/projects/${task.project.id}`} className="text-sm font-medium hover:underline">
                    {task.project.name}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{format(new Date(task.createdAt), "MMM d, yyyy")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
