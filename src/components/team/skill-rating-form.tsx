"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface SkillRatingFormProps {
  teamMemberId: string
  taskCategoryId: string
  currentRating: number
}

export function SkillRatingForm({ teamMemberId, taskCategoryId, currentRating }: SkillRatingFormProps) {
  const [rating, setRating] = useState(currentRating)
  const [hovering, setHovering] = useState(0)
  const [saving, setSaving] = useState(false)

  async function handleRate(newRating: number) {
    setRating(newRating)
    setSaving(true)
    try {
      await fetch("/api/skill-ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamMemberId, taskCategoryId, rating: newRating }),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={saving}
          onMouseEnter={() => setHovering(star)}
          onMouseLeave={() => setHovering(0)}
          onClick={() => handleRate(star)}
          className="p-0.5 hover:scale-110 transition-transform disabled:opacity-50"
        >
          <Star
            className={cn(
              "h-4 w-4",
              (hovering || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
      {saving && <span className="text-[10px] text-muted-foreground ml-1">...</span>}
    </div>
  )
}
