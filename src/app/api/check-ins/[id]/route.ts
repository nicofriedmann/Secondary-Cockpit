import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const checkIn = await prisma.checkIn.findUnique({
    where: { id },
    include: {
      teamMember: true,
      actionItems: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 })
  }
  return NextResponse.json(checkIn)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.checkIn.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
