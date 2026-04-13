import { NewProjectForm } from "@/components/projects/new-project-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewProjectPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>
      <h1 className="text-2xl font-bold">New Project</h1>
      <NewProjectForm />
    </div>
  )
}
