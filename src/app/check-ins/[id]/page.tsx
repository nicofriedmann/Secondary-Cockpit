import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react"
import { ActionItemToggle } from "@/components/check-ins/action-item-toggle"

export const dynamic = "force-dynamic"

export default async function CheckInDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const checkIn = await prisma.checkIn.findUnique({
    where: { id },
    include: {
      teamMember: {
        select: { id: true, firstName: true, lastName: true, title: true, department: true },
      },
      actionItems: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!checkIn) return notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/check-ins" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Check-ins
      </Link>

      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
          {checkIn.teamMember.firstName[0]}{checkIn.teamMember.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {checkIn.type.charAt(0).toUpperCase() + checkIn.type.slice(1)} Check-in
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Link href={`/team/${checkIn.teamMember.id}`} className="text-sm font-medium hover:underline">
              {checkIn.teamMember.firstName} {checkIn.teamMember.lastName}
            </Link>
            <span className="text-sm text-muted-foreground">— {checkIn.teamMember.title}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(checkIn.checkInDate), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {checkIn.wins && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-green-700">Wins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{checkIn.wins}</p>
            </CardContent>
          </Card>
        )}

        {checkIn.challenges && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-orange-700">Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{checkIn.challenges}</p>
            </CardContent>
          </Card>
        )}

        {checkIn.nextSteps && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-blue-700">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{checkIn.nextSteps}</p>
            </CardContent>
          </Card>
        )}

        {checkIn.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{checkIn.notes}</p>
            </CardContent>
          </Card>
        )}

        {checkIn.actionItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Action Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checkIn.actionItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2 rounded border">
                  <ActionItemToggle id={item.id} isCompleted={item.isCompleted} />
                  <div className="flex-1">
                    <p className={`text-sm ${item.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {item.description}
                    </p>
                    {item.dueDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due {format(new Date(item.dueDate), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
