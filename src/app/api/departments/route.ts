import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const departments = await prisma.department.findMany({
    include: {
      taskCategories: { orderBy: { sortOrder: "asc" } },
      _count: { select: { teamMembers: true, tasks: true } },
    },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(departments)
}
