import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { taskSchema } from "@/lib/validations/task"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const departmentId = searchParams.get("departmentId")
  const status = searchParams.get("status")
  const assigneeId = searchParams.get("assigneeId")

  const tasks = await prisma.task.findMany({
    where: {
      ...(departmentId ? { departmentId } : {}),
      ...(status ? { status } : {}),
      ...(assigneeId ? { assigneeId } : {}),
    },
    include: {
      department: true,
      taskCategory: true,
      assignee: { select: { id: true, firstName: true, lastName: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(tasks)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      },
      include: {
        department: true,
        taskCategory: true,
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    return NextResponse.json(task, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
