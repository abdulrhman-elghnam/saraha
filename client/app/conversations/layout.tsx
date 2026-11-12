"use client"

import React, { useEffect } from "react"
import { useParams } from "next/navigation"
import { Loader2, Lock } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConversationList } from "@/components/conversations/conversation-list"

export default function ConversationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading, t, openAuthModal } = useAuth()
  const params = useParams<{ id?: string }>()
  const activeId = params?.id

  useEffect(() => {
    if (!loading && !isAuthenticated) openAuthModal("signin")
  }, [loading, isAuthenticated, openAuthModal])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <Card className="rounded-[2.5rem] border border-border p-8 shadow-md">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Lock className="size-8" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t.conversations.loginRequired}
          </p>
          <Button
            onClick={() => openAuthModal("signin")}
            className="mt-6 h-11 w-full rounded-2xl text-xs font-semibold"
          >
            {t.nav.signIn}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-0 sm:px-6 sm:py-6">
      <div className="flex h-[calc(100dvh-4rem)] overflow-hidden border-border bg-card sm:h-[calc(100dvh-7rem)] sm:rounded-[2rem] sm:border sm:shadow-sm">
        {/* On mobile show either the list or the open conversation; side by side from md up. */}
        <aside
          className={cn(
            "w-full shrink-0 border-border/60 md:block md:w-80 md:border-e",
            activeId ? "hidden" : "block"
          )}
        >
          <ConversationList activeId={activeId} />
        </aside>
        <section
          className={cn(
            "min-w-0 flex-1",
            activeId ? "block" : "hidden md:block"
          )}
        >
          {children}
        </section>
      </div>
    </div>
  )
}
