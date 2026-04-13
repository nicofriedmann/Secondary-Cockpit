import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkInSchema } from "@/lib/validations/check-in"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const teamMemberId = searchParams.get("teamMemberId")

  const checkIns = await prisma.checkIn.findMany({
    where: teamMemberId ? { teamMemberId } : undefined,
    include: {
      teamMember: { select: { id: true, firstName: true, lastName: true, title: true } },
      actionItems: true,
    },
    orderBy: { checkInDate: "desc" },
  })
  return NextResponse.json(checkIns)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = checkInSchema.parse(body)

    const { actionItems, ...checkInData } = validated

    const checkIn = await prisma.checkIn.create({
      data: {
        ...checkInData,
        actionItems: actionItems
          ? {
              create: actionItems.map((item) => ({
                description: item.description,
                dueDate: item.dueDate ? new Date(item.dueDate) : null,
              })),
            }
          : undefined,
      },
      include: { teamMember: true, actionItems: true },
    })
    return NextResponse.json(checkIn, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 })
  }
}
