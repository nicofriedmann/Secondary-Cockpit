import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { teamMemberSchema } from "@/lib/validations/team-member"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const member = await prisma.teamMember.findUnique({
    where: { id },
    include: {
      department: { include: { taskCategories: { orderBy: { sortOrder: "asc" } } } },
      manager: { select: { id: true, firstName: true, lastName: true, title: true } },
      directReports: { select: { id: true, firstName: true, lastName: true, title: true, role: true } },
      skillRatings: { include: { taskCategory: true } },
      assignedTasks: { include: { department: true, taskCategory: true }, orderBy: { createdAt: "desc" } },
      checkIns: { orderBy: { checkInDate: "desc" }, take: 10, include: { actionItems: true } },
    },
  })

  if (!member) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 })
  }

  return NextResponse.json(member)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = teamMemberSchema.parse(body)

    const member = await prisma.teamMember.update({
      where: { id },
      data: validated,
      include: { department: true },
    })
    return NextResponse.json(member)
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.teamMember.update({
    where: { id },
    data: { isActive: false },
  })
  return NextResponse.json({ success: true })
}
