"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Search, UserCheck, ArrowRight, Sparkles } from "lucide-react"

interface UserSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserSearchDialog({ open, onOpenChange }: UserSearchDialogProps) {
  const router = useRouter()
  const { lang, t } = useAuth()
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = query.trim().replace(/^@/, "")
    if (!clean) return
    onOpenChange(false)
    router.push(`/u/${encodeURIComponent(clean)}`)
  }

  const handleSelectDemo = (username: string) => {
    onOpenChange(false)
    router.push(`/u/${username}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Search className="size-4" />
            </div>
            <div>
              <DialogTitle>
                {lang === "ar" ? "ابحث عن صديق على صراحة" : "Find Someone on Saraha"}
              </DialogTitle>
              <DialogDescription>
                {lang === "ar"
                  ? "أدخل اسم المستخدم لزيارة صفحته وإرسال رسالة صريحة له"
                  : "Enter their username to visit their page and send an anonymous message"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "ar" ? "اسم المستخدم (مثال: ahmed123)" : "Username (e.g. ahmed123)"}
              className="h-11 ps-4 pe-10 text-sm"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              className="absolute end-1.5 top-1.5 h-8 gap-1 rounded-2xl px-3"
              disabled={!query.trim()}
            >
              <span>{lang === "ar" ? "انتقال" : "Go"}</span>
              <ArrowRight className="size-3.5 rtl:rotate-180" />
            </Button>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3 text-amber-500" />
              <span>{lang === "ar" ? "حسابات تجريبية سريعة:" : "Quick Demo Profile:"}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo("ahmed123")}
                className="group flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-medium transition hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <UserCheck className="size-3" />
                </div>
                <span>@ahmed123</span>
                <span className="text-[10px] text-muted-foreground">
                  ({lang === "ar" ? "نشط" : "Verified"})
                </span>
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
