"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, X } from "lucide-react"

interface NewCheckInFormProps {
  members: { id: string; firstName: string; lastName: string; title: string }[]
}

export function NewCheckInForm({ members }: NewCheckInFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    teamMemberId: "",
    type: "weekly",
    wins: "",
    challenges: "",
    nextSteps: "",
    notes: "",
  })
  const [actionItems, setActionItems] = useState<{ description: string; dueDate: string }[]>([])

  function addActionItem() {
    setActionItems([...actionItems, { description: "", dueDate: "" }])
  }

  function removeActionItem(index: number) {
    setActionItems(actionItems.filter((_, i) => i !== index))
  }

  function updateActionItem(index: number, field: string, value: string) {
    const updated = [...actionItems]
    updated[index] = { ...updated[index], [field]: value }
    setActionItems(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.teamMemberId) return
    setSaving(true)
    try {
      const res = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          actionItems: actionItems
            .filter((a) => a.description)
            .map((a) => ({ description: a.description, dueDate: a.dueDate || null })),
        }),
      })
      if (res.ok) {
        router.push("/check-ins")
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Team Member *</Label>
              <Select value={form.teamMemberId} onValueChange={(v) => setForm({ ...form, teamMemberId: v })}>
                <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="ad_hoc">Ad Hoc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Wins</Label>
            <Textarea value={form.wins} onChange={(e) => setForm({ ...form, wins: e.target.value })} rows={3} placeholder="What went well this period?" />
          </div>

          <div>
            <Label>Challenges</Label>
            <Textarea value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} rows={3} placeholder="What obstacles or challenges came up?" />
          </div>

          <div>
            <Label>Next Steps</Label>
            <Textarea value={form.nextSteps} onChange={(e) => setForm({ ...form, nextSteps: e.target.value })} rows={3} placeholder="Planned priorities for next period" />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Additional notes" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Action Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addActionItem}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {actionItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={item.description}
                    onChange={(e) => updateActionItem(i, "description", e.target.value)}
                    placeholder="Action item description"
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={item.dueDate}
                    onChange={(e) => updateActionItem(i, "dueDate", e.target.value)}
                    className="w-[150px]"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeActionItem(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving || !form.teamMemberId}>
              {saving ? "Creating..." : "Create Check-in"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
