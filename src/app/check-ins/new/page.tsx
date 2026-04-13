import { prisma } from "@/lib/prisma"
import { NewCheckInForm } from "@/components/check-ins/new-check-in-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NewCheckInPage() {
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, title: true },
    orderBy: { lastName: "asc" },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/check-ins" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Check-ins
      </Link>
      <h1 className="text-2xl font-bold">New Check-in</h1>
      <NewCheckInForm members={members} />
    </div>
  )
}
