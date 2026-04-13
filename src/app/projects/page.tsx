import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PROJECT_STATUSES } from "@/types"
import { format } from "date-fns"
import Link from "next/link"
import { Plus, Calendar } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      milestones: { orderBy: { sortOrder: "asc" } },
      members: {
        include: { teamMember: { select: { id: true, firstName: true, lastName: true } } },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">{projects.length} projects</p>
        </div>
        <Link href="/projects/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((project) => {
          const statusInfo = PROJECT_STATUSES.find((s) => s.value === project.status)
          const completedMilestones = project.milestones.filter((m) => m.completedAt).length
          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {statusInfo && <Badge className={statusInfo.color}>{statusInfo.label}</Badge>}
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {(project.startDate || project.endDate) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {project.startDate && format(new Date(project.startDate), "MMM d, yyyy")}
                      {project.startDate && project.endDate && " — "}
                      {project.endDate && format(new Date(project.endDate), "MMM d, yyyy")}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px]">{project._count.tasks} tasks</Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {completedMilestones}/{project.milestones.length} milestones
                    </Badge>
                  </div>

                  {project.milestones.length > 0 && (
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{
                          width: `${(completedMilestones / project.milestones.length) * 100}%`,
                        }}
                      />
                    </div>
                  )}

                  {project.members.length > 0 && (
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 5).map((pm) => (
                        <div
                          key={pm.id}
                          className="h-7 w-7 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-semibold text-primary"
                          title={`${pm.teamMember.firstName} ${pm.teamMember.lastName}`}
                        >
                          {pm.teamMember.firstName[0]}{pm.teamMember.lastName[0]}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
