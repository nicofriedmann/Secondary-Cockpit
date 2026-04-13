import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { Plus, CheckCircle2, Circle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CheckInsPage() {
  const checkIns = await prisma.checkIn.findMany({
    include: {
      teamMember: {
        select: { id: true, firstName: true, lastName: true, title: true, department: true },
      },
      actionItems: true,
    },
    orderBy: { checkInDate: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Check-ins</h1>
          <p className="text-muted-foreground">{checkIns.length} check-in records</p>
        </div>
        <Link href="/check-ins/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Check-in
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {checkIns.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">No check-ins recorded yet.</p>
        ) : (
          checkIns.map((checkIn) => {
            const completedActions = checkIn.actionItems.filter((a) => a.isCompleted).length
            const totalActions = checkIn.actionItems.length
            return (
              <Link key={checkIn.id} href={`/check-ins/${checkIn.id}`}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0"
                        >
                          {checkIn.teamMember.firstName[0]}{checkIn.teamMember.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">{checkIn.teamMember.firstName} {checkIn.teamMember.lastName}</p>
                          <p className="text-xs text-muted-foreground">{checkIn.teamMember.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{checkIn.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(checkIn.checkInDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      {checkIn.wins && (
                        <p className="text-sm"><span className="font-medium text-green-700">Wins:</span> {checkIn.wins.substring(0, 120)}{checkIn.wins.length > 120 ? "..." : ""}</p>
                      )}
                      {checkIn.challenges && (
                        <p className="text-sm"><span className="font-medium text-orange-700">Challenges:</span> {checkIn.challenges.substring(0, 120)}{checkIn.challenges.length > 120 ? "..." : ""}</p>
                      )}
                    </div>

                    {totalActions > 0 && (
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        {completedActions === totalActions ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                        {completedActions}/{totalActions} action items
                      </div>
                    )}
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
