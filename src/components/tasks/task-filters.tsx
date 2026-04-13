"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TASK_STATUSES } from "@/types"
import { X } from "lucide-react"

interface TaskFiltersProps {
  departments: { id: string; name: string }[]
  members: { id: string; firstName: string; lastName: string }[]
  current: { departmentId?: string; status?: string; assigneeId?: string }
}

export function TaskFilters({ departments, members, current }: TaskFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/tasks?${params.toString()}`)
  }

  function clearFilters() {
    router.push("/tasks")
  }

  const hasFilters = current.departmentId || current.status || current.assigneeId

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={current.departmentId || ""} onValueChange={(v) => setFilter("departmentId", v || undefined)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={current.status || ""} onValueChange={(v) => setFilter("status", v || undefined)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          {TASK_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={current.assigneeId || ""} onValueChange={(v) => setFilter("assigneeId", v || undefined)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Assignees" />
        </SelectTrigger>
        <SelectContent>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" /> Clear
        </Button>
      )}
    </div>
  )
}
