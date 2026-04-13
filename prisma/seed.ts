import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import path from "node:path"

const dbPath = path.join(process.cwd(), "dev.db")
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clean existing data
  await prisma.actionItem.deleteMany()
  await prisma.checkIn.deleteMany()
  await prisma.followUpReminder.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.milestone.deleteMany()
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.skillRating.deleteMany()
  await prisma.taskCategory.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.department.deleteMany()

  // ─── DEPARTMENTS ───
  const lockDesk = await prisma.department.create({
    data: {
      name: "Lock Desk",
      description: "Rate lock processing, pricing, and pipeline management for mortgage originations",
      color: "#3B82F6",
    },
  })

  const secondaryServicing = await prisma.department.create({
    data: {
      name: "Secondary Servicing",
      description: "Mortgage servicing operations including payment processing, escrow management, and borrower support",
      color: "#10B981",
    },
  })

  const capitalMarkets = await prisma.department.create({
    data: {
      name: "Capital Markets",
      description: "Secondary market trading, hedging, investor relations, and securities management",
      color: "#8B5CF6",
    },
  })

  // ─── TASK CATEGORIES ───
  const lockDeskCategories = [
    { name: "Rate Locks", description: "Process and manage mortgage rate lock requests" },
    { name: "Extensions", description: "Handle rate lock extension requests and approvals" },
    { name: "Re-locks", description: "Process rate re-lock requests when locks expire or need adjustment" },
    { name: "Pricing Reviews", description: "Review and validate loan pricing across products and investors" },
    { name: "Pipeline Monitoring", description: "Monitor loan pipeline, track lock expirations and volume" },
    { name: "Daily Reporting", description: "Compile and distribute daily lock desk reports and metrics" },
    { name: "Exception Approvals", description: "Review and process exception requests per lock desk policy" },
  ]

  const servicingCategories = [
    { name: "Payment Processing", description: "Collect and process monthly mortgage payments from borrowers" },
    { name: "Borrower Inquiries", description: "Handle borrower questions, account inquiries, and support requests" },
    { name: "Delinquency Management", description: "Manage delinquent accounts and loss mitigation efforts" },
    { name: "Escrow Management", description: "Manage escrow accounts for taxes, insurance, and assessments" },
    { name: "Account Setup", description: "Set up new loan accounts after closing and boarding" },
    { name: "Compliance Documentation", description: "Ensure regulatory compliance and maintain required documentation" },
    { name: "Loan Closeouts", description: "Process payoffs, satisfactions, and account closures" },
  ]

  const capitalMarketsCategories = [
    { name: "Pipeline Management", description: "Monitor and manage the secondary market loan pipeline" },
    { name: "Pricing", description: "Set competitive product pricing and manage rate sheets" },
    { name: "Trading Execution", description: "Execute loan sales and best execution decisions with investors" },
    { name: "Hedging", description: "Manage interest rate risk through TBA and other hedging strategies" },
    { name: "Investor Relations", description: "Maintain relationships with agency and non-agency investors" },
    { name: "Securities Creation", description: "Create and deliver GNMA, Fannie Mae, and Freddie Mac securities" },
    { name: "Trade Reconciliation", description: "Reconcile trades, settlements, and post-trade operations" },
  ]

  for (let i = 0; i < lockDeskCategories.length; i++) {
    await prisma.taskCategory.create({
      data: { ...lockDeskCategories[i], departmentId: lockDesk.id, sortOrder: i },
    })
  }
  for (let i = 0; i < servicingCategories.length; i++) {
    await prisma.taskCategory.create({
      data: { ...servicingCategories[i], departmentId: secondaryServicing.id, sortOrder: i },
    })
  }
  for (let i = 0; i < capitalMarketsCategories.length; i++) {
    await prisma.taskCategory.create({
      data: { ...capitalMarketsCategories[i], departmentId: capitalMarkets.id, sortOrder: i },
    })
  }

  // ─── TEAM MEMBERS ───
  const director = await prisma.teamMember.create({
    data: {
      firstName: "Sarah",
      lastName: "Mitchell",
      email: "sarah.mitchell@lendzfinancial.com",
      title: "Director of Secondary Operations",
      role: "director",
      departmentId: lockDesk.id,
      strengths: "Strategic planning, team leadership, investor relationships",
      weaknesses: "Can be overly detail-oriented on minor issues",
      startDate: new Date("2020-03-15"),
    },
  })

  const lockDeskManager = await prisma.teamMember.create({
    data: {
      firstName: "James",
      lastName: "Chen",
      email: "james.chen@lendzfinancial.com",
      title: "Lock Desk Manager",
      role: "manager",
      departmentId: lockDesk.id,
      managerId: director.id,
      strengths: "Pricing accuracy, pipeline management, process optimization",
      weaknesses: "Delegation — tends to take on too much personally",
      startDate: new Date("2021-06-01"),
    },
  })

  const servicingManager = await prisma.teamMember.create({
    data: {
      firstName: "Maria",
      lastName: "Rodriguez",
      email: "maria.rodriguez@lendzfinancial.com",
      title: "Servicing Operations Manager",
      role: "manager",
      departmentId: secondaryServicing.id,
      managerId: director.id,
      strengths: "Borrower relations, compliance knowledge, team mentoring",
      weaknesses: "Sometimes slow to adopt new technology",
      startDate: new Date("2021-01-10"),
    },
  })

  const analyst1 = await prisma.teamMember.create({
    data: {
      firstName: "Kevin",
      lastName: "Park",
      email: "kevin.park@lendzfinancial.com",
      title: "Senior Lock Desk Analyst",
      role: "individual_contributor",
      departmentId: lockDesk.id,
      managerId: lockDeskManager.id,
      strengths: "Fast and accurate lock processing, strong with pricing engines",
      weaknesses: "Communication with loan officers could improve",
      startDate: new Date("2022-04-15"),
    },
  })

  const analyst2 = await prisma.teamMember.create({
    data: {
      firstName: "Ashley",
      lastName: "Thompson",
      email: "ashley.thompson@lendzfinancial.com",
      title: "Lock Desk Analyst",
      role: "individual_contributor",
      departmentId: lockDesk.id,
      managerId: lockDeskManager.id,
      strengths: "Detail-oriented, great at exception handling",
      weaknesses: "Needs more experience with complex pricing scenarios",
      startDate: new Date("2023-02-01"),
    },
  })

  const servicingSpec1 = await prisma.teamMember.create({
    data: {
      firstName: "David",
      lastName: "Williams",
      email: "david.williams@lendzfinancial.com",
      title: "Senior Servicing Specialist",
      role: "individual_contributor",
      departmentId: secondaryServicing.id,
      managerId: servicingManager.id,
      strengths: "Escrow expertise, delinquency management, regulatory knowledge",
      weaknesses: "Can be resistant to process changes",
      startDate: new Date("2021-09-01"),
    },
  })

  const servicingSpec2 = await prisma.teamMember.create({
    data: {
      firstName: "Lisa",
      lastName: "Nguyen",
      email: "lisa.nguyen@lendzfinancial.com",
      title: "Servicing Specialist",
      role: "individual_contributor",
      departmentId: secondaryServicing.id,
      managerId: servicingManager.id,
      strengths: "Excellent borrower communication, quick learner",
      weaknesses: "Newer to compliance documentation requirements",
      startDate: new Date("2024-01-15"),
    },
  })

  // ─── SAMPLE TASKS ───
  const ldCategories = await prisma.taskCategory.findMany({ where: { departmentId: lockDesk.id } })
  const ssCategories = await prisma.taskCategory.findMany({ where: { departmentId: secondaryServicing.id } })

  await prisma.task.createMany({
    data: [
      {
        title: "Process morning rate lock batch",
        description: "Review and process all rate lock requests received overnight",
        status: "in_progress",
        priority: "high",
        departmentId: lockDesk.id,
        taskCategoryId: ldCategories.find(c => c.name === "Rate Locks")?.id,
        assigneeId: analyst1.id,
        dueDate: new Date(Date.now() + 86400000),
      },
      {
        title: "Review pending extension requests",
        description: "5 lock extension requests pending approval",
        status: "todo",
        priority: "high",
        departmentId: lockDesk.id,
        taskCategoryId: ldCategories.find(c => c.name === "Extensions")?.id,
        assigneeId: analyst2.id,
        dueDate: new Date(Date.now() + 86400000),
      },
      {
        title: "Compile weekly pipeline report",
        description: "Generate weekly pipeline report for management review",
        status: "todo",
        priority: "medium",
        departmentId: lockDesk.id,
        taskCategoryId: ldCategories.find(c => c.name === "Daily Reporting")?.id,
        assigneeId: lockDeskManager.id,
        dueDate: new Date(Date.now() + 3 * 86400000),
      },
      {
        title: "Resolve borrower escrow dispute",
        description: "Borrower flagged escrow shortage — verify analysis and contact",
        status: "in_progress",
        priority: "high",
        departmentId: secondaryServicing.id,
        taskCategoryId: ssCategories.find(c => c.name === "Escrow Management")?.id,
        assigneeId: servicingSpec1.id,
        dueDate: new Date(Date.now() + 2 * 86400000),
      },
      {
        title: "Board 12 new loans from last week closings",
        description: "Set up new loan accounts for loans closed last week",
        status: "todo",
        priority: "medium",
        departmentId: secondaryServicing.id,
        taskCategoryId: ssCategories.find(c => c.name === "Account Setup")?.id,
        assigneeId: servicingSpec2.id,
        dueDate: new Date(Date.now() + 5 * 86400000),
      },
      {
        title: "Monthly compliance audit preparation",
        description: "Prepare documentation for upcoming monthly compliance audit",
        status: "todo",
        priority: "medium",
        departmentId: secondaryServicing.id,
        taskCategoryId: ssCategories.find(c => c.name === "Compliance Documentation")?.id,
        assigneeId: servicingManager.id,
        dueDate: new Date(Date.now() + 7 * 86400000),
      },
      {
        title: "Follow up on 3 delinquent accounts (60+ days)",
        status: "todo",
        priority: "urgent",
        departmentId: secondaryServicing.id,
        taskCategoryId: ssCategories.find(c => c.name === "Delinquency Management")?.id,
        assigneeId: servicingSpec1.id,
        dueDate: new Date(Date.now() + 86400000),
      },
      {
        title: "Review pricing engine exception for jumbo product",
        status: "blocked",
        priority: "high",
        departmentId: lockDesk.id,
        taskCategoryId: ldCategories.find(c => c.name === "Exception Approvals")?.id,
        assigneeId: lockDeskManager.id,
        dueDate: new Date(Date.now() + 86400000),
      },
    ],
  })

  // ─── SAMPLE PROJECT ───
  const project = await prisma.project.create({
    data: {
      name: "Q2 Lock Desk Process Optimization",
      description: "Streamline lock desk workflows to reduce average lock processing time by 20%",
      status: "active",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-06-30"),
    },
  })

  await prisma.milestone.createMany({
    data: [
      { name: "Workflow audit complete", projectId: project.id, dueDate: new Date("2026-04-15"), sortOrder: 0 },
      { name: "New SLA targets defined", projectId: project.id, dueDate: new Date("2026-05-01"), sortOrder: 1 },
      { name: "Process changes implemented", projectId: project.id, dueDate: new Date("2026-05-31"), sortOrder: 2 },
      { name: "30-day metrics review", projectId: project.id, dueDate: new Date("2026-06-30"), sortOrder: 3 },
    ],
  })

  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, teamMemberId: director.id, role: "stakeholder" },
      { projectId: project.id, teamMemberId: lockDeskManager.id, role: "lead" },
      { projectId: project.id, teamMemberId: analyst1.id, role: "member" },
    ],
  })

  // ─── SAMPLE CHECK-IN ───
  const checkIn = await prisma.checkIn.create({
    data: {
      teamMemberId: lockDeskManager.id,
      checkInDate: new Date(Date.now() - 3 * 86400000),
      type: "weekly",
      wins: "Reduced average lock processing time by 8% this week. Kevin handled a record number of locks with zero errors.",
      challenges: "Extension request volume spiked 30% — need to investigate root cause. May be related to longer underwriting times.",
      nextSteps: "Meet with underwriting team about turnaround times. Review extension policy thresholds.",
      notes: "James is showing strong leadership. Consider for expanded role in Q3.",
    },
  })

  await prisma.actionItem.createMany({
    data: [
      { checkInId: checkIn.id, description: "Schedule meeting with underwriting team lead", dueDate: new Date(Date.now() + 3 * 86400000) },
      { checkInId: checkIn.id, description: "Pull extension request trend data for last 90 days", dueDate: new Date(Date.now() + 5 * 86400000) },
      { checkInId: checkIn.id, description: "Draft updated extension policy proposal", dueDate: new Date(Date.now() + 10 * 86400000) },
    ],
  })

  console.log("Seed data created successfully!")
  console.log(`  - 3 departments`)
  console.log(`  - 21 task categories`)
  console.log(`  - 7 team members`)
  console.log(`  - 8 tasks`)
  console.log(`  - 1 project with 4 milestones`)
  console.log(`  - 1 check-in with 3 action items`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
