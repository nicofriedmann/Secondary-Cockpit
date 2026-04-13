import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TASK_STATUSES, TASK_PRIORITIES } from "@/types"
import { format } from "date-fns"
import Link from "next/link"
import { Plus } from "lucide-react"
import { TaskFilters } from "@/components/tasks/task-filters"

export const dynamic = "force-dynamic"

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ departmentId?: string; status?: string; assigneeId?: string }>
}) {
  const sp = await searchParams
  const [tasks, departments, members] = await Promise.all([
    prisma.task.findMany({
      where: {
        ...(sp.departmentId ? { departmentId: sp.departmentId } : {}),
        ...(sp.status ? { status: sp.status } : {}),
        ...(sp.assigneeId ? { assigneeId: sp.assigneeId } : {}),
      },
      include: {
        department: true,
        taskCategory: true,
        assignee: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.teamMember.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">{tasks.length} tasks</p>
        </div>
        <Link href="/tasks/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      <TaskFilters departments={departments} members={members} current={sp} />

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">No tasks found.</p>
        ) : (
          tasks.map((task) => {
            const statusInfo = TASK_STATUSES.find((s) => s.value === task.status)
            const priorityInfo = TASK_PRIORITIES.find((p) => p.value === task.priority)
            return (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {statusInfo && <Badge variant="outline" className={`text-[10px] ${statusInfo.color}`}>{statusInfo.label}</Badge>}
                        {priorityInfo && <Badge variant="outline" className={`text-[10px] ${priorityInfo.color}`}>{priorityInfo.label}</Badge>}
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.department.color || "#6B7280" }} />
                          <span className="text-xs text-muted-foreground">{task.department.name}</span>
                        </div>
                        {task.taskCategory && (
                          <span className="text-xs text-muted-foreground">/ {task.taskCategory.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      {task.assignee && (
                        <span className="text-xs text-muted-foreground">
                          {task.assignee.firstName} {task.assignee.lastName[0]}.
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(task.dueDate), "MMM d")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
