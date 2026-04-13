"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Circle } from "lucide-react"

export function ActionItemToggle({ id, isCompleted }: { id: string; isCompleted: boolean }) {
  const router = useRouter()
  const [completed, setCompleted] = useState(isCompleted)
  const [saving, setSaving] = useState(false)

  async function toggle() {
    const newValue = !completed
    setCompleted(newValue)
    setSaving(true)
    try {
      await fetch(`/api/action-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newValue }),
      })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <button onClick={toggle} disabled={saving} className="mt-0.5 shrink-0">
      {completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
      )}
    </button>
  )
}
