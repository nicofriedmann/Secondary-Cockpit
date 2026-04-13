import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { taskSchema } from "@/lib/validations/task"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      department: true,
      taskCategory: true,
      assignee: true,
      createdBy: true,
      project: true,
    },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }
  return NextResponse.json(task)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = taskSchema.parse(body)

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        completedAt: validated.status === "done" ? new Date() : null,
      },
      include: { department: true, assignee: true },
    })
    return NextResponse.json(task)
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
