"use client"

import React from "react"
import { useAuth } from "@/lib/auth-context"
import { InboxDashboard } from "@/components/dashboard/inbox-dashboard"
import { LandingPage } from "@/components/landing/landing-page"
import { Loader2, MessageSquare } from "lucide-react"

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/25 animate-pulse">
          <MessageSquare className="size-7" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Loader2 className="size-3.5 animate-spin text-primary" />
          <span>Saraha • صراحة</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <InboxDashboard />
  }

  return <LandingPage />
}
