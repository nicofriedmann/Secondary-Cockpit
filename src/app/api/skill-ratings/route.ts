import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamMemberId, taskCategoryId, rating, notes } = body

    const skillRating = await prisma.skillRating.upsert({
      where: {
        teamMemberId_taskCategoryId: { teamMemberId, taskCategoryId },
      },
      update: { rating, notes },
      create: { teamMemberId, taskCategoryId, rating, notes },
      include: { taskCategory: true },
    })
    return NextResponse.json(skillRating)
  } catch {
    return NextResponse.json({ error: "Failed to update skill rating" }, { status: 500 })
  }
}
