"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { InboxDashboard } from "@/components/dashboard/inbox-dashboard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Lock, MessageSquare, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const { isAuthenticated, loading, lang, t, openAuthModal } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      openAuthModal("signin")
    }
  }, [loading, isAuthenticated, openAuthModal])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/25 animate-pulse">
          <MessageSquare className="size-7" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Loader2 className="size-3.5 animate-spin text-primary" />
          <span>{lang === "ar" ? "جاري تحميل لوحة التحكم..." : "Loading dashboard..."}</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <Card className="rounded-[2.5rem] border border-border p-8 shadow-md">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-4">
            <Lock className="size-8" />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            {lang === "ar" ? "تسجيل الدخول مطلوب" : "Authentication Required"}
          </h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {lang === "ar"
              ? "يرجى تسجيل الدخول للوصول إلى صندوق الرسائل ولوحة التحكم الخاصة بك."
              : "Please sign in to access your Saraha inbox and dashboard."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              onClick={() => openAuthModal("signin")}
              className="w-full h-11 rounded-2xl text-xs font-semibold gap-1.5"
            >
              <span>{t.nav.signIn}</span>
              <ArrowRight className="size-3.5 rtl:rotate-180" />
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full h-10 rounded-2xl text-xs">
                {t.publicProfile.backHome}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return <InboxDashboard />
}
