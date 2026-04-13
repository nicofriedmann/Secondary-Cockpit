import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MEMBER_ROLES, TASK_STATUSES, TASK_PRIORITIES } from "@/types"
import { format } from "date-fns"
import Link from "next/link"
import { ArrowLeft, Star } from "lucide-react"
import { SkillRatingForm } from "@/components/team/skill-rating-form"

export const dynamic = "force-dynamic"

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const member = await prisma.teamMember.findUnique({
    where: { id },
    include: {
      department: { include: { taskCategories: { orderBy: { sortOrder: "asc" } } } },
      manager: { select: { id: true, firstName: true, lastName: true, title: true } },
      directReports: {
        where: { isActive: true },
        select: { id: true, firstName: true, lastName: true, title: true, role: true },
      },
      skillRatings: { include: { taskCategory: true } },
      assignedTasks: {
        include: { department: true, taskCategory: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      checkIns: {
        orderBy: { checkInDate: "desc" },
        take: 10,
        include: { actionItems: true },
      },
    },
  })

  if (!member) return notFound()

  const roleInfo = MEMBER_ROLES.find((r) => r.value === member.role)
  const skillMap = new Map(member.skillRatings.map((sr) => [sr.taskCategoryId, sr]))

  return (
    <div className="space-y-6">
      <Link href="/team" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Team
      </Link>

      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
          {member.firstName[0]}{member.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{member.firstName} {member.lastName}</h1>
          <p className="text-muted-foreground">{member.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: member.department.color || "#6B7280" }} />
            <span className="text-sm">{member.department.name}</span>
            <Badge variant="outline">{roleInfo?.label}</Badge>
          </div>
          {member.manager && (
            <p className="text-sm text-muted-foreground mt-1">
              Reports to{" "}
              <Link href={`/team/${member.manager.id}`} className="hover:underline font-medium">
                {member.manager.firstName} {member.manager.lastName}
              </Link>
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({member.assignedTasks.length})</TabsTrigger>
          <TabsTrigger value="checkins">Check-ins ({member.checkIns.length})</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skill Ratings — {member.department.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.department.taskCategories.map((category) => {
                const existing = skillMap.get(category.id)
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{category.name}</p>
                      {category.description && (
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <SkillRatingForm
                        teamMemberId={member.id}
                        taskCategoryId={category.id}
                        currentRating={existing?.rating || 0}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-3">
          {member.assignedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No tasks assigned.</p>
          ) : (
            member.assignedTasks.map((task) => {
              const statusInfo = TASK_STATUSES.find((s) => s.value === task.status)
              const priorityInfo = TASK_PRIORITIES.find((p) => p.value === task.priority)
              return (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {statusInfo && <Badge variant="outline" className={`text-[10px] ${statusInfo.color}`}>{statusInfo.label}</Badge>}
                          {priorityInfo && <Badge variant="outline" className={`text-[10px] ${priorityInfo.color}`}>{priorityInfo.label}</Badge>}
                          {task.taskCategory && <span className="text-xs text-muted-foreground">{task.taskCategory.name}</span>}
                        </div>
                      </div>
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">{format(new Date(task.dueDate), "MMM d")}</span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="checkins" className="space-y-3">
          {member.checkIns.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No check-ins recorded yet.</p>
          ) : (
            member.checkIns.map((checkIn) => (
              <Link key={checkIn.id} href={`/check-ins/${checkIn.id}`}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">{checkIn.type}</Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(checkIn.checkInDate), "MMM d, yyyy")}</span>
                    </div>
                    {checkIn.wins && <p className="text-sm"><strong>Wins:</strong> {checkIn.wins.substring(0, 100)}...</p>}
                    {checkIn.actionItems.length > 0 && (
                      <p className="text-xs text-muted-foreground">{checkIn.actionItems.filter((a) => a.isCompleted).length}/{checkIn.actionItems.length} action items completed</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardContent className="p-6 space-y-4">
              {member.strengths && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Strengths</h3>
                  <p className="text-sm text-muted-foreground">{member.strengths}</p>
                </div>
              )}
              {member.weaknesses && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Areas for Improvement</h3>
                  <p className="text-sm text-muted-foreground">{member.weaknesses}</p>
                </div>
              )}
              {member.email && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Email</h3>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              )}
              {member.phone && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Phone</h3>
                  <p className="text-sm text-muted-foreground">{member.phone}</p>
                </div>
              )}
              {member.startDate && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Start Date</h3>
                  <p className="text-sm text-muted-foreground">{format(new Date(member.startDate), "MMMM d, yyyy")}</p>
                </div>
              )}
              {member.directReports.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Direct Reports</h3>
                  <div className="space-y-1">
                    {member.directReports.map((report) => (
                      <Link key={report.id} href={`/team/${report.id}`} className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {report.firstName[0]}{report.lastName[0]}
                        </div>
                        <span className="text-sm">{report.firstName} {report.lastName}</span>
                        <span className="text-xs text-muted-foreground capitalize">— {report.role.replace("_", " ")}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
