"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MessageItem, getAssetUrl, api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ShareCardDialog } from "./share-card-dialog"
import {
  ShieldCheck,
  Clock,
  Trash2,
  Copy,
  Check,
  Share2,
  ImageIcon,
  Maximize2,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface MessageCardProps {
  message: MessageItem
  onDeleted?: (messageId: string) => void
}

export function MessageCard({ message, onDeleted }: MessageCardProps) {
  const { lang, t } = useAuth()
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const messageId = message.id || message._id

  const handleCopy = async () => {
    if (!message.content) return
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast.success(t.dashboard.copied)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.messages.delete(messageId)
      toast.success(
        lang === "ar" ? "تم حذف الرسالة بنجاح" : "Message deleted successfully"
      )
      setDeleteOpen(false)
      onDeleted?.(messageId)
    } catch (err: any) {
      toast.error(err.message || "Failed to delete message")
    } finally {
      setIsDeleting(false)
    }
  }

  // Format relative or calendar date
  const dateStr = message.createdAt
    ? new Date(message.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : ""

  const attachments = message.attachments || []

  return (
    <>
      <Card className="relative overflow-hidden border border-border/80 bg-card p-5 shadow-sm transition hover:shadow-md hover:border-primary/30">
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
            </span>
            <span className="text-xs font-semibold text-foreground">
              {lang === "ar" ? "مرسل مجهول" : "Anonymous Sender"}
            </span>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
              Saraha
            </Badge>
          </div>

          {dateStr ? (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="size-3" />
              <span>{dateStr}</span>
            </div>
          ) : null}
        </div>

        {/* Message Content */}
        <div className="py-3">
          {message.content ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground select-text">
              {message.content}
            </p>
          ) : (
            <p className="text-xs italic text-muted-foreground">
              {lang === "ar" ? "(لا يوجد نص، صورة مرفقة فقط)" : "(No text, photo attachment only)"}
            </p>
          )}

          {/* Attachments gallery */}
          {attachments.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2.5">
              {attachments.map((filePath, index) => {
                const assetUrl = getAssetUrl(filePath)
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(assetUrl)}
                    className="group relative size-24 overflow-hidden rounded-2xl border border-border/70 bg-muted transition hover:opacity-95 hover:ring-2 hover:ring-primary/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={assetUrl}
                      alt={`Attachment ${index + 1}`}
                      className="size-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                      <Maximize2 className="size-4 text-white" />
                    </div>
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setShareOpen(true)}
              className="h-8 gap-1 rounded-xl px-2.5 text-xs text-primary hover:bg-primary/10"
            >
              <Share2 className="size-3.5" />
              <span>{t.dashboard.shareCard}</span>
            </Button>

            {message.content ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleCopy}
                className="h-8 gap-1 rounded-xl px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                <span>{copied ? t.dashboard.copied : t.dashboard.copyText}</span>
              </Button>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setDeleteOpen(true)}
            className="size-8 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete message"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </Card>

      {/* Share Story Card Dialog */}
      <ShareCardDialog
        message={message}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />

      {/* Image Preview Lightbox Dialog */}
      {selectedImage ? (
        <Dialog open={Boolean(selectedImage)} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="sm:max-w-xl p-2 bg-black/95 border-neutral-800">
            <div className="relative flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt="Enlarged attachment"
                className="max-h-[80vh] w-auto rounded-2xl object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader className="items-center text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-6" />
            </div>
            <DialogTitle className="mt-2">{t.dashboard.deleteMessageTitle}</DialogTitle>
            <DialogDescription>{t.dashboard.deleteMessageConfirm}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
              className="h-10 rounded-2xl text-xs"
            >
              {t.dashboard.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-10 rounded-2xl text-xs gap-1.5"
            >
              {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              <span>{t.dashboard.delete}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
