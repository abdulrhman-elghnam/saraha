"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { MessageItem } from "@/lib/api"
import { Copy, Check, Sparkles, MessageCircle, Heart, Share2 } from "lucide-react"
import { toast } from "sonner"

interface ShareCardDialogProps {
  message: MessageItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ThemeKey = "emerald" | "sunset" | "dark" | "violet"

export function ShareCardDialog({ message, open, onOpenChange }: ShareCardDialogProps) {
  const { lang, t } = useAuth()
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("emerald")
  const [copiedText, setCopiedText] = useState(false)

  if (!message) return null

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content || "")
      setCopiedText(true)
      toast.success(t.dashboard.copied)
      setTimeout(() => setCopiedText(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const themes: Record<ThemeKey, { bg: string; text: string; sub: string; accent: string; label: string }> = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950",
      text: "text-white",
      sub: "text-emerald-100/80",
      accent: "bg-white/15 border-white/20 text-white",
      label: t.storyCard.themeEmerald,
    },
    sunset: {
      bg: "bg-gradient-to-br from-amber-500 via-rose-600 to-purple-900",
      text: "text-white",
      sub: "text-rose-100/80",
      accent: "bg-white/15 border-white/20 text-white",
      label: t.storyCard.themeSunset,
    },
    dark: {
      bg: "bg-gradient-to-br from-zinc-900 via-stone-900 to-black",
      text: "text-white",
      sub: "text-zinc-400",
      accent: "bg-white/10 border-white/15 text-white",
      label: t.storyCard.themeDark,
    },
    violet: {
      bg: "bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700",
      text: "text-white",
      sub: "text-purple-100/80",
      accent: "bg-white/15 border-white/20 text-white",
      label: t.storyCard.themeViolet,
    },
  }

  const activeTheme = themes[selectedTheme]

  const dateStr = message.createdAt
    ? new Date(message.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
      })
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Share2 className="size-4" />
            </div>
            <div>
              <DialogTitle>{t.storyCard.title}</DialogTitle>
              <DialogDescription>{t.storyCard.desc}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Theme Picker */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(Object.keys(themes) as ThemeKey[]).map((key) => {
            const isSelected = selectedTheme === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTheme(key)}
                className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                    : "border-border/80 bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <span
                  className={`size-2.5 rounded-full ${
                    key === "emerald"
                      ? "bg-emerald-500"
                      : key === "sunset"
                        ? "bg-amber-500"
                        : key === "dark"
                          ? "bg-zinc-800"
                          : "bg-purple-500"
                  }`}
                />
                <span>{themes[key].label}</span>
              </button>
            )
          })}
        </div>

        {/* Story Card Preview */}
        <div
          id="saraha-story-card"
          className={`relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-2xl transition-all duration-300 ${activeTheme.bg} ${activeTheme.text}`}
        >
          {/* Decorative shapes */}
          <div className="absolute -top-12 -end-12 size-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -start-12 size-40 rounded-full bg-black/20 blur-2xl pointer-events-none" />

          {/* Card Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className={`flex items-center gap-2 rounded-2xl border px-3 py-1 text-xs backdrop-blur-md ${activeTheme.accent}`}>
              <Sparkles className="size-3 text-amber-300" />
              <span className="font-semibold tracking-wide">
                {lang === "ar" ? "رسالة سرية • صراحة" : "Anonymous • Saraha"}
              </span>
            </div>
            {dateStr ? (
              <span className={`text-[11px] font-medium tracking-tight ${activeTheme.sub}`}>
                {dateStr}
              </span>
            ) : null}
          </div>

          {/* Card Message Body */}
          <div className="relative z-10 my-6 flex flex-col justify-center">
            <div className="mb-2 text-white/40">
              <MessageCircle className="size-6 rotate-12" />
            </div>
            <p className="text-lg font-medium leading-relaxed drop-shadow-sm select-all">
              {message.content || (lang === "ar" ? "(صورة مرفقة)" : "(Photo attachment)")}
            </p>
          </div>

          {/* Card Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider">
              <Heart className="size-3.5 fill-rose-400 text-rose-400 animate-pulse" />
              <span>saraha.app</span>
            </div>
            <span className={`text-[11px] font-medium ${activeTheme.sub}`}>
              {lang === "ar" ? "صارحني برأيك" : "Speak your mind"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyText}
            className="h-10 rounded-2xl text-xs gap-1.5"
          >
            {copiedText ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            <span>{copiedText ? t.dashboard.copied : t.storyCard.copyCardText}</span>
          </Button>

          <Button
            type="button"
            onClick={() => {
              toast.success(
                lang === "ar"
                  ? "خذ لقطة شاشة للبطاقة وشاركها مباشرة على ستوري إنستغرام أو واتساب!"
                  : "Take a screenshot of the card to share directly on your Instagram or WhatsApp story!"
              )
            }}
            className="h-10 rounded-2xl text-xs gap-1.5 bg-primary text-primary-foreground"
          >
            <Sparkles className="size-3.5" />
            <span>{lang === "ar" ? "جاهز للستوري ✨" : "Ready for Story ✨"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
