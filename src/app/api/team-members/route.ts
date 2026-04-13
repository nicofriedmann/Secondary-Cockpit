import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { teamMemberSchema } from "@/lib/validations/team-member"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const departmentId = searchParams.get("departmentId")

  const members = await prisma.teamMember.findMany({
    where: {
      ...(departmentId ? { departmentId } : {}),
      isActive: true,
    },
    include: {
      department: true,
      manager: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { assignedTasks: true, directReports: true } },
    },
    orderBy: { lastName: "asc" },
  })
  return NextResponse.json(members)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = teamMemberSchema.parse(body)

    const member = await prisma.teamMember.create({
      data: validated,
      include: { department: true },
    })
    return NextResponse.json(member, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 })
  }
}
