import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const actionItem = await prisma.actionItem.update({
    where: { id },
    data: {
      isCompleted: body.isCompleted,
      completedAt: body.isCompleted ? new Date() : null,
    },
  })
  return NextResponse.json(actionItem)
}
