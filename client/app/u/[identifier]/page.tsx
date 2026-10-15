"use client"

import React, { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api, PublicUser, getAssetUrl } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  ShieldCheck,
  Sparkles,
  Send,
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Heart,
  MessageSquare,
  UserX,
} from "lucide-react"
import { toast } from "sonner"

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { lang, t, openAuthModal } = useAuth()

  const identifier = params?.identifier as string

  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Message compose form state
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!identifier) return
    const fetchUser = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const data = await api.user.getPublicProfile(identifier)
        if (data) {
          setUser(data)
        } else {
          setNotFound(true)
        }
      } catch (err: any) {
        console.warn("User lookup error:", err.message)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [identifier])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handlePromptClick = (promptText: string) => {
    if (!content.trim()) {
      setContent(`${promptText}: `)
    } else {
      setContent((prev) => `${prev}\n${promptText}: `)
    }
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // Max 2 attachments supported by backend
    const combined = [...attachments, ...files].slice(0, 2)
    setAttachments(combined)

    // Generate previews
    const newPreviews = combined.map((f) => URL.createObjectURL(f))
    setPreviews(newPreviews)

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveAttachment = (index: number) => {
    const updatedFiles = attachments.filter((_, i) => i !== index)
    const updatedPreviews = previews.filter((_, i) => i !== index)
    setAttachments(updatedFiles)
    setPreviews(updatedPreviews)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const trimmed = content.trim()
    if (!trimmed && attachments.length === 0) {
      toast.error(lang === "ar" ? "يرجى كتابة رسالة أو إرفاق صورة" : "Please enter a message or attach a photo")
      return
    }

    setSending(true)
    try {
      await api.messages.send({
        receiverId: user.id,
        content: trimmed || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      })

      setSentSuccess(true)
      setContent("")
      setAttachments([])
      setPreviews([])
      toast.success(t.publicProfile.successTitle)
    } catch (err: any) {
      toast.error(err.message || "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleResetForAnother = () => {
    setSentSuccess(false)
    setContent("")
    setAttachments([])
    setPreviews([])
  }

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs">
            {lang === "ar" ? "جاري تحميل الملف الشخصي..." : "Loading profile..."}
          </p>
        </div>
      </div>
    )
  }

  if (notFound || !user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <Card className="rounded-[2.5rem] border border-border p-8 shadow-md">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-muted text-muted-foreground mb-4">
            <UserX className="size-8" />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            {t.publicProfile.notFoundTitle}
          </h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {t.publicProfile.notFoundSub}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full h-10 rounded-2xl text-xs font-semibold">
                {t.publicProfile.backHome}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const initials = (user.fullName || user.username || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="container mx-auto max-w-xl px-4 py-8 sm:py-12">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="size-3.5 rtl:rotate-180" />
          <span>{t.nav.home}</span>
        </Link>
      </div>

      {sentSuccess ? (
        /* Sent Confirmation Screen */
        <Card className="overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-4 animate-bounce">
            <CheckCircle2 className="size-8" />
          </div>

          <h2 className="font-heading text-2xl font-bold text-foreground">
            {t.publicProfile.successTitle}
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t.publicProfile.successSub}{" "}
            <span className="font-semibold text-foreground">@{user.username}</span>.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              type="button"
              onClick={handleResetForAnother}
              variant="outline"
              className="h-11 w-full rounded-2xl text-xs font-semibold"
            >
              {t.publicProfile.sendAnother}
            </Button>

            <Button
              type="button"
              onClick={() => openAuthModal("signup")}
              className="h-11 w-full rounded-2xl text-xs font-semibold bg-primary text-primary-foreground gap-2"
            >
              <Sparkles className="size-4" />
              <span>{t.publicProfile.createOwn}</span>
            </Button>
          </div>
        </Card>
      ) : (
        /* Message Composer Screen */
        <div className="space-y-6">
          {/* Recipient Profile Card */}
          <Card className="relative overflow-hidden rounded-[2.5rem] border border-border/80 bg-gradient-to-br from-card via-card to-muted/30 p-6 text-center shadow-sm">
            <div className="flex flex-col items-center">
              <Avatar className="size-20 border-4 border-background shadow-md">
                {user.profileImage ? (
                  <AvatarImage src={getAssetUrl(user.profileImage)} alt={user.fullName} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <h1 className="mt-3 font-heading text-xl font-bold text-foreground">
                {user.fullName}
              </h1>
              <p className="text-xs font-mono text-muted-foreground">@{user.username}</p>

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === "ar" ? "حساب مؤكد لاستقبال الصراحة" : "Ready for Honest Messages"}</span>
              </div>
            </div>
          </Card>

          {/* Prompt chips */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t.publicProfile.promptsTitle}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                t.publicProfile.prompt1,
                t.publicProfile.prompt2,
                t.publicProfile.prompt3,
                t.publicProfile.prompt4,
              ].map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePromptClick(prompt)}
                  className="rounded-2xl border border-border/80 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-foreground text-start"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Compose Form */}
          <Card className="rounded-[2.2rem] border border-border/80 bg-card p-5 sm:p-6 shadow-md">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 1000))}
                    placeholder={t.publicProfile.messagePlaceholder}
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-border/80 bg-background p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                  <div className="mt-1 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                    <span>{t.publicProfile.maxChars}</span>
                    <span className={content.length >= 900 ? "text-amber-600 font-semibold" : ""}>
                      {content.length} / 1000 {t.publicProfile.charCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photo Previews */}
              {previews.length > 0 ? (
                <div className="flex items-center gap-2 pt-1">
                  {previews.map((previewUrl, index) => (
                    <div
                      key={index}
                      className="group relative size-20 overflow-hidden rounded-2xl border border-border shadow-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Attachment preview"
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="absolute end-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-destructive transition"
                        title="Remove photo"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  {attachments.length < 2 ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex size-20 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/30 text-muted-foreground transition hover:border-primary/50 hover:bg-muted"
                    >
                      <Camera className="size-5" />
                      <span className="mt-1 text-[10px]">Add +</span>
                    </button>
                  ) : null}
                </div>
              ) : null}

              {/* Add Attachment Button */}
              {previews.length === 0 ? (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 gap-1.5 rounded-2xl text-xs border-border/80"
                  >
                    <Camera className="size-3.5 text-muted-foreground" />
                    <span>{t.publicProfile.attachmentsLabel}</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    className="hidden"
                    onChange={handleFilesSelected}
                  />
                </div>
              ) : null}

              {/* Anonymity Promise */}
              <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{t.publicProfile.anonymousNotice}</span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={sending || (!content.trim() && attachments.length === 0)}
                className="w-full h-12 rounded-3xl text-sm font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t.publicProfile.sending}</span>
                  </>
                ) : (
                  <>
                    <Send className="size-4 rtl:rotate-180" />
                    <span>{t.publicProfile.sendButton}</span>
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
