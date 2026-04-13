import { prisma } from "@/lib/prisma"
import { NewTaskForm } from "@/components/tasks/new-task-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NewTaskPage() {
  const [departments, members] = await Promise.all([
    prisma.department.findMany({
      include: { taskCategories: { orderBy: { sortOrder: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.teamMember.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ])

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/tasks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
      </Link>
      <h1 className="text-2xl font-bold">New Task</h1>
      <NewTaskForm departments={departments} members={members} />
    </div>
  )
}
