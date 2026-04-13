import { prisma } from "@/lib/prisma"
import { NewTeamMemberForm } from "@/components/team/new-team-member-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NewTeamMemberPage() {
  const [departments, members] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.teamMember.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ])

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/team" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Team
      </Link>
      <h1 className="text-2xl font-bold">Add Team Member</h1>
      <NewTeamMemberForm departments={departments} members={members} />
    </div>
  )
}
