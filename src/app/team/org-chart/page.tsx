import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MEMBER_ROLES } from "@/types"
import { OrgChartTree } from "@/components/team/org-chart-tree"

export const dynamic = "force-dynamic"

export default async function OrgChartPage() {
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    include: {
      department: true,
      _count: { select: { directReports: true, assignedTasks: true } },
    },
    orderBy: { lastName: "asc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/team" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Team
          </Link>
          <h1 className="text-2xl font-bold">Organization Chart</h1>
          <p className="text-muted-foreground">Team hierarchy and reporting structure</p>
        </div>
      </div>

      <OrgChartTree members={members} />
    </div>
  )
}
