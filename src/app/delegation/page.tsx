import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DelegationPage() {
  const departments = await prisma.department.findMany({
    include: {
      taskCategories: {
        orderBy: { sortOrder: "asc" },
        include: {
          skillRatings: {
            include: {
              teamMember: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          _count: { select: { tasks: true } },
        },
      },
      teamMembers: {
        where: { isActive: true },
        select: { id: true, firstName: true, lastName: true, title: true, role: true },
        orderBy: { lastName: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Delegation Matrix</h1>
        <p className="text-muted-foreground">
          Department responsibilities and task category assignments across Lendz Financial.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: dept.color || "#6B7280" }} />
                <div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <CardDescription className="text-xs">{dept.description}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{dept.teamMembers.length} members</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Task Categories</h4>
              {dept.taskCategories.map((category) => {
                const assignedMembers = category.skillRatings
                  .filter((sr) => sr.rating >= 3)
                  .map((sr) => sr.teamMember)
                return (
                  <div key={category.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {category._count.tasks} tasks
                      </Badge>
                    </div>
                    {category.description && (
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    )}
                    {assignedMembers.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {assignedMembers.map((m) => (
                          <Link
                            key={m.id}
                            href={`/team/${m.id}`}
                            className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded hover:bg-secondary/80"
                          >
                            {m.firstName} {m.lastName[0]}.
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="pt-3 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Team</h4>
                <div className="space-y-1">
                  {dept.teamMembers.map((member) => (
                    <Link
                      key={member.id}
                      href={`/team/${member.id}`}
                      className="flex items-center justify-between p-2 rounded hover:bg-accent text-sm"
                    >
                      <span>{member.firstName} {member.lastName}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {member.role.replace("_", " ")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
