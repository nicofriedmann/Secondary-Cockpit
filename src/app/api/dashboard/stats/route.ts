import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)

  const [
    totalTasks,
    completedThisWeek,
    overdueTasks,
    inProgressTasks,
    totalMembers,
    totalProjects,
    departments,
    upcomingTasks,
    recentCheckIns,
  ] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({
      where: { status: "done", completedAt: { gte: weekAgo } },
    }),
    prisma.task.count({
      where: {
        status: { not: "done" },
        dueDate: { lt: now },
      },
    }),
    prisma.task.count({ where: { status: "in_progress" } }),
    prisma.teamMember.count({ where: { isActive: true } }),
    prisma.project.count({ where: { status: { in: ["planning", "active"] } } }),
    prisma.department.findMany({
      include: {
        _count: {
          select: { teamMembers: true, tasks: true },
        },
        tasks: {
          where: { status: { not: "done" } },
          select: { status: true },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        status: { not: "done" },
        dueDate: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) },
      },
      include: {
        assignee: { select: { firstName: true, lastName: true } },
        department: { select: { name: true, color: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    prisma.checkIn.findMany({
      orderBy: { checkInDate: "desc" },
      take: 5,
      include: {
        teamMember: { select: { firstName: true, lastName: true } },
      },
    }),
  ])

  return NextResponse.json({
    totalTasks,
    completedThisWeek,
    overdueTasks,
    inProgressTasks,
    totalMembers,
    totalProjects,
    departments,
    upcomingTasks,
    recentCheckIns,
  })
}
