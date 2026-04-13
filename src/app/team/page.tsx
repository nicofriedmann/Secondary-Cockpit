import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Plus, Network } from "lucide-react"
import { MEMBER_ROLES } from "@/types"

export const dynamic = "force-dynamic"

export default async function TeamPage() {
  const [members, departments] = await Promise.all([
    prisma.teamMember.findMany({
      where: { isActive: true },
      include: {
        department: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { assignedTasks: true, directReports: true } },
      },
      orderBy: [{ role: "asc" }, { lastName: "asc" }],
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ])

  const groupedByDept = departments.map((dept) => ({
    ...dept,
    members: members.filter((m) => m.departmentId === dept.id),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">{members.length} active team members across {departments.length} departments</p>
        </div>
        <div className="flex gap-2">
          <Link href="/team/org-chart">
            <Button variant="outline" size="sm">
              <Network className="h-4 w-4 mr-2" />
              Org Chart
            </Button>
          </Link>
          <Link href="/team/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </Link>
        </div>
      </div>

      {groupedByDept.map((dept) => (
        <div key={dept.id}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color || "#6B7280" }} />
            <h2 className="text-lg font-semibold">{dept.name}</h2>
            <Badge variant="secondary">{dept.members.length}</Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dept.members.map((member) => {
              const roleInfo = MEMBER_ROLES.find((r) => r.value === member.role)
              return (
                <Link key={member.id} href={`/team/${member.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                              {member.firstName[0]}{member.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium">{member.firstName} {member.lastName}</p>
                              <p className="text-xs text-muted-foreground">{member.title}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-[10px]">{roleInfo?.label}</Badge>
                        {member._count.assignedTasks > 0 && (
                          <Badge variant="secondary" className="text-[10px]">{member._count.assignedTasks} tasks</Badge>
                        )}
                        {member._count.directReports > 0 && (
                          <Badge variant="secondary" className="text-[10px]">{member._count.directReports} reports</Badge>
                        )}
                      </div>
                      {member.manager && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Reports to {member.manager.firstName} {member.manager.lastName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
