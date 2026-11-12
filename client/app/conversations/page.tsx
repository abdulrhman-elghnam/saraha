"use client"

import { MessagesSquare } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function ConversationsIndexPage() {
  const { t } = useAuth()
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <MessagesSquare className="size-7" />
      </div>
      <p className="text-sm text-muted-foreground">
        {t.conversations.selectPrompt}
      </p>
    </div>
  )
}
