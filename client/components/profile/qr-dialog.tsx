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
import { Copy, Check, QrCode, Share2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface QrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  username?: string
}

export function QrDialog({ open, onOpenChange, username }: QrDialogProps) {
  const { user, lang, t } = useAuth()
  const [copied, setCopied] = useState(false)

  const targetUsername = username || user?.username || ""
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  const profileUrl = `${origin}/u/${targetUsername}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      toast.success(t.nav.copiedLink)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  // Generate QR code image URL using standard qr API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    profileUrl
  )}&color=191817&bgcolor=ffffff&margin=1`

  const shareText =
    lang === "ar"
      ? `صارحني برسالة سرية ومجهولة دون أن أعرف هويتك على صراحة:`
      : `Send me an anonymous message on Saraha:`

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText} ${profileUrl}`
  )}`

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${shareText}`
  )}&url=${encodeURIComponent(profileUrl)}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <QrCode className="size-6" />
          </div>
          <DialogTitle className="mt-2">
            {lang === "ar" ? "رمز QR الخاص بك" : "Your Saraha QR Code"}
          </DialogTitle>
          <DialogDescription>
            {lang === "ar"
              ? "امسح الرمز أو شارك الرابط لتصلك رسائل أصدقائك"
              : "Scan this code or share your link to get candid messages"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col items-center justify-center">
          <div className="relative overflow-hidden rounded-3xl border-2 border-border/80 bg-white p-4 shadow-sm">
            {/* QR code */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageUrl}
              alt="Saraha QR Code"
              width={200}
              height={200}
              className="size-48 rounded-xl object-contain"
            />
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>@{targetUsername}</span>
            </div>
          </div>

          <div className="mt-4 flex w-full items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 p-1.5 px-3 text-xs">
            <span className="truncate text-muted-foreground font-mono text-[11px]">
              {profileUrl}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="ms-auto h-7 gap-1 rounded-xl text-xs"
            >
              {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
              <span>{copied ? t.dashboard.copied : t.dashboard.copyLink}</span>
            </Button>
          </div>

          <div className="mt-4 grid w-full grid-cols-2 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 py-2.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-400"
            >
              <Share2 className="size-3.5" />
              <span>{t.dashboard.whatsapp}</span>
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-sky-500/20 bg-sky-500/10 py-2.5 text-xs font-medium text-sky-700 transition hover:bg-sky-500/20 dark:text-sky-400"
            >
              <ExternalLink className="size-3.5" />
              <span>{t.dashboard.twitter}</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
