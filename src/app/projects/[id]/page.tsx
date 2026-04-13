import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PROJECT_STATUSES, TASK_STATUSES, TASK_PRIORITIES } from "@/types"
import { format } from "date-fns"
import Link from "next/link"
import { ArrowLeft, Calendar, CheckCircle2, Circle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { sortOrder: "asc" } },
      members: {
        include: { teamMember: { select: { id: true, firstName: true, lastName: true, title: true } } },
      },
      tasks: {
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true } },
          taskCategory: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!project) return notFound()

  const statusInfo = PROJECT_STATUSES.find((s) => s.value === project.status)

  return (
    <div className="space-y-6">
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <div>
        <div className="flex items-start gap-3">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {statusInfo && <Badge className={statusInfo.color}>{statusInfo.label}</Badge>}
        </div>
        {project.description && (
          <p className="text-muted-foreground mt-1">{project.description}</p>
        )}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Calendar className="h-4 w-4" />
            {project.startDate && format(new Date(project.startDate), "MMM d, yyyy")}
            {project.startDate && project.endDate && " — "}
            {project.endDate && format(new Date(project.endDate), "MMM d, yyyy")}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {project.milestones.length === 0 ? (
                <p className="text-sm text-muted-foreground">No milestones defined.</p>
              ) : (
                <div className="space-y-3">
                  {project.milestones.map((milestone, i) => (
                    <div key={milestone.id} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {milestone.completedAt ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${milestone.completedAt ? "line-through text-muted-foreground" : ""}`}>
                          {milestone.name}
                        </p>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground">{milestone.description}</p>
                        )}
                        {milestone.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due {format(new Date(milestone.dueDate), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tasks ({project.tasks.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks linked to this project.</p>
              ) : (
                project.tasks.map((task) => {
                  const taskStatus = TASK_STATUSES.find((s) => s.value === task.status)
                  const taskPriority = TASK_PRIORITIES.find((p) => p.value === task.priority)
                  return (
                    <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center justify-between p-2 rounded border hover:bg-accent">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {taskStatus && <Badge variant="outline" className={`text-[10px] ${taskStatus.color}`}>{taskStatus.label}</Badge>}
                          {taskPriority && <Badge variant="outline" className={`text-[10px] ${taskPriority.color}`}>{taskPriority.label}</Badge>}
                        </div>
                      </div>
                      {task.assignee && (
                        <span className="text-xs text-muted-foreground">{task.assignee.firstName} {task.assignee.lastName[0]}.</span>
                      )}
                    </Link>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team ({project.members.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.members.map((pm) => (
                <Link
                  key={pm.id}
                  href={`/team/${pm.teamMember.id}`}
                  className="flex items-center gap-2 p-2 rounded hover:bg-accent"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {pm.teamMember.firstName[0]}{pm.teamMember.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pm.teamMember.firstName} {pm.teamMember.lastName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{pm.role}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
