"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ShieldCheck, Heart, MessageSquare } from "lucide-react"

export function Footer() {
  const { lang, t } = useAuth()

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/20 py-10 transition-colors">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand & Mission */}
          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <MessageSquare className="size-3.5" />
              </div>
              <span className="font-heading font-bold text-foreground">Saraha • صراحة</span>
            </div>
            <p className="text-xs text-muted-foreground text-center sm:text-start max-w-sm">
              {lang === "ar"
                ? "منصة الرسائل الصادقة والسرية. صُممت لتمكين التواصل البناء دون إفصاح عن الهوية."
                : "The honest anonymous feedback platform. Designed for candid, constructive communication without exposure."}
            </p>
          </div>

          {/* Privacy badge */}
          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-3.5 py-1.5 text-xs text-muted-foreground shadow-xs">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {lang === "ar"
                ? "أمان وسرية تامة 100% لجميع الرسائل"
                : "100% Anonymous & Secure Messaging"}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Saraha. {lang === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>{lang === "ar" ? "صُنع بـ" : "Crafted with"}</span>
              <Heart className="size-3 text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
