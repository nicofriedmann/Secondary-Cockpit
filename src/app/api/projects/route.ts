import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { projectSchema } from "@/lib/validations/project"

export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      milestones: { orderBy: { sortOrder: "asc" } },
      members: { include: { teamMember: { select: { id: true, firstName: true, lastName: true } } } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(projects)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = projectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        ...validated,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
      },
    })
    return NextResponse.json(project, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
