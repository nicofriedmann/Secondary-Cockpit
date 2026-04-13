import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TASK_STATUSES, TASK_PRIORITIES } from "@/types"
import {
  CheckSquare,
  Users,
  FolderKanban,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)

  const [
    totalTasks,
    completedThisWeek,
    overdueTasks,
    inProgressTasks,
    totalMembers,
    activeProjects,
    departments,
    upcomingTasks,
    overdueTasksList,
  ] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: "done", completedAt: { gte: weekAgo } } }),
    prisma.task.count({ where: { status: { not: "done" }, dueDate: { lt: now } } }),
    prisma.task.count({ where: { status: "in_progress" } }),
    prisma.teamMember.count({ where: { isActive: true } }),
    prisma.project.count({ where: { status: { in: ["planning", "active"] } } }),
    prisma.department.findMany({
      include: {
        _count: { select: { teamMembers: true, tasks: true } },
        tasks: { where: { status: { not: "done" } }, select: { status: true, priority: true } },
      },
    }),
    prisma.task.findMany({
      where: { status: { not: "done" }, dueDate: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) } },
      include: {
        assignee: { select: { firstName: true, lastName: true } },
        department: { select: { name: true, color: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
    prisma.task.findMany({
      where: { status: { not: "done" }, dueDate: { lt: now } },
      include: {
        assignee: { select: { firstName: true, lastName: true } },
        department: { select: { name: true, color: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
  ])

  const stats = [
    { label: "Total Tasks", value: totalTasks, icon: CheckSquare, color: "text-blue-600" },
    { label: "Completed This Week", value: completedThisWeek, icon: TrendingUp, color: "text-green-600" },
    { label: "In Progress", value: inProgressTasks, icon: Clock, color: "text-yellow-600" },
    { label: "Overdue", value: overdueTasks, icon: AlertTriangle, color: "text-red-600" },
    { label: "Team Members", value: totalMembers, icon: Users, color: "text-purple-600" },
    { label: "Active Projects", value: activeProjects, icon: FolderKanban, color: "text-indigo-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your management cockpit, Nico.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Department Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments.map((dept) => {
              const openTasks = dept.tasks.length
              const urgentTasks = dept.tasks.filter((t) => t.priority === "urgent" || t.priority === "high").length
              return (
                <div key={dept.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color || "#6B7280" }} />
                    <div>
                      <Link href="/delegation" className="font-medium hover:underline">{dept.name}</Link>
                      <p className="text-xs text-muted-foreground">{dept._count.teamMembers} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{openTasks} open</Badge>
                    {urgentTasks > 0 && (
                      <Badge variant="destructive">{urgentTasks} urgent</Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming deadlines this week.</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex-1 min-w-0">
                      <Link href={`/tasks/${task.id}`} className="text-sm font-medium hover:underline truncate block">
                        {task.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground ml-2 shrink-0">
                      {task.dueDate && format(new Date(task.dueDate), "MMM d")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {overdueTasksList.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueTasksList.map((task) => {
                const priorityInfo = TASK_PRIORITIES.find((p) => p.value === task.priority)
                const statusInfo = TASK_STATUSES.find((s) => s.value === task.status)
                return (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded border border-red-100 bg-red-50/50">
                    <div className="flex-1 min-w-0">
                      <Link href={`/tasks/${task.id}`} className="text-sm font-medium hover:underline truncate block">
                        {task.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"}
                        </span>
                        {statusInfo && <Badge variant="outline" className={`text-[10px] ${statusInfo.color}`}>{statusInfo.label}</Badge>}
                        {priorityInfo && <Badge variant="outline" className={`text-[10px] ${priorityInfo.color}`}>{priorityInfo.label}</Badge>}
                      </div>
                    </div>
                    <div className="text-xs text-red-600 ml-2 shrink-0">
                      Due {task.dueDate && format(new Date(task.dueDate), "MMM d")}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
