"use client"

import { Tree, TreeNode } from "react-organizational-chart"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MEMBER_ROLES } from "@/types"

interface MemberData {
  id: string
  firstName: string
  lastName: string
  title: string
  role: string
  managerId: string | null
  department: { name: string; color: string | null }
  _count: { directReports: number; assignedTasks: number }
}

function MemberNode({ member }: { member: MemberData }) {
  const roleInfo = MEMBER_ROLES.find((r) => r.value === member.role)
  return (
    <Link href={`/team/${member.id}`}>
      <div className="inline-block border rounded-lg p-3 bg-card shadow-sm hover:shadow-md transition-shadow min-w-[160px] text-left">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <div>
            <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
            <p className="text-[10px] text-muted-foreground">{member.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: member.department.color || "#6B7280" }} />
          <span className="text-[10px] text-muted-foreground">{member.department.name}</span>
          {roleInfo && <Badge variant="outline" className="text-[8px] ml-auto">{roleInfo.label}</Badge>}
        </div>
      </div>
    </Link>
  )
}

function TreeBranch({ member, allMembers }: { member: MemberData; allMembers: MemberData[] }) {
  const reports = allMembers.filter((m) => m.managerId === member.id)

  if (reports.length === 0) {
    return <TreeNode label={<MemberNode member={member} />} />
  }

  return (
    <TreeNode label={<MemberNode member={member} />}>
      {reports.map((report) => (
        <TreeBranch key={report.id} member={report} allMembers={allMembers} />
      ))}
    </TreeNode>
  )
}

export function OrgChartTree({ members }: { members: MemberData[] }) {
  const roots = members.filter((m) => !m.managerId)

  if (roots.length === 0) {
    return <p className="text-muted-foreground">No team hierarchy configured.</p>
  }

  return (
    <div className="overflow-x-auto pb-8">
      {roots.map((root) => (
        <Tree
          key={root.id}
          lineWidth="2px"
          lineColor="hsl(var(--border))"
          lineBorderRadius="4px"
          label={<MemberNode member={root} />}
        >
          {members
            .filter((m) => m.managerId === root.id)
            .map((report) => (
              <TreeBranch key={report.id} member={report} allMembers={members} />
            ))}
        </Tree>
      ))}
    </div>
  )
}
