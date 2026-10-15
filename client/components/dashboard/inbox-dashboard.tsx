"use client"

import React, { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { api, MessageItem, getAssetUrl } from "@/lib/api"
import { MessageCard } from "@/components/messages/message-card"
import { QrDialog } from "@/components/profile/qr-dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  Check,
  QrCode,
  Share2,
  ExternalLink,
  MessageSquare,
  Search,
  RefreshCw,
  ImageIcon,
  Sparkles,
  Inbox,
  Loader2,
  Send,
} from "lucide-react"
import { toast } from "sonner"

export function InboxDashboard() {
  const { user, lang, t, openSettings } = useAuth()
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "photos">("all")

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  const publicUrl = user ? `${origin}/u/${user.username}` : ""

  const loadMessages = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const list = await api.messages.list()
      setMessages(list)
    } catch (err: any) {
      console.warn("Failed to load messages:", err.message)
      toast.error(err.message || "Failed to load messages")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleCopyLink = async () => {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopiedLink(true)
      toast.success(t.nav.copiedLink)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const handleMessageDeleted = (deletedId: string) => {
    setMessages((prev) => prev.filter((m) => (m.id || m._id) !== deletedId))
  }

  const shareText =
    lang === "ar"
      ? `صارحني برسالة سرية ومجهولة دون أن أعرف هويتك على صراحة:`
      : `Send me an anonymous message on Saraha:`

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText} ${publicUrl}`
  )}`

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${shareText}`
  )}&url=${encodeURIComponent(publicUrl)}`

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Photo filter
      if (filterType === "photos" && (!msg.attachments || msg.attachments.length === 0)) {
        return false
      }
      // Search query
      if (searchQuery.trim()) {
        const text = (msg.content || "").toLowerCase()
        return text.includes(searchQuery.trim().toLowerCase())
      }
      return true
    })
  }, [messages, filterType, searchQuery])

  const photosCount = messages.filter((m) => m.attachments && m.attachments.length > 0).length

  const initials = (user?.fullName || user?.username || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* User Header & Link Share Banner */}
      <div className="space-y-6">
        <Card className="relative overflow-hidden rounded-[2.2rem] border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <Avatar className="size-16 sm:size-20 border-2 border-background shadow-md">
                {user?.profileImage ? (
                  <AvatarImage src={getAssetUrl(user.profileImage)} alt={user.fullName} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-lg sm:text-xl font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {user?.fullName}
                  </h1>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    {lang === "ar" ? "حساب موثق" : "Verified"}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                  @{user?.username}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <Link
                    href={`/u/${user?.username}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                  >
                    <span>{lang === "ar" ? "زيارة صفحة استقبال الرسائل" : "View your public page"}</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQrOpen(true)}
                className="h-10 rounded-2xl gap-2 text-xs border-border/80"
              >
                <QrCode className="size-4" />
                <span>{t.dashboard.qrCode}</span>
              </Button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-xs font-medium text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 transition"
              >
                <Share2 className="size-3.5" />
                <span>{t.dashboard.whatsapp}</span>
              </a>

              <a
                href={twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 text-xs font-medium text-sky-700 hover:bg-sky-500/20 dark:text-sky-300 transition"
              >
                <ExternalLink className="size-3.5" />
                <span>{t.dashboard.twitter}</span>
              </a>
            </div>
          </div>

          {/* Copy Link Input Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-border/80 bg-background/80 p-2 text-xs backdrop-blur-sm">
            <div className="flex items-center gap-2 px-3 text-muted-foreground flex-1 min-w-0">
              <span className="font-semibold text-foreground whitespace-nowrap">
                {lang === "ar" ? "رابطك الشخصي:" : "Your Saraha Link:"}
              </span>
              <span className="truncate font-mono text-[11px] select-all">
                {publicUrl}
              </span>
            </div>

            <Button
              type="button"
              onClick={handleCopyLink}
              size="sm"
              className="h-9 gap-1.5 rounded-xl px-4 text-xs font-semibold bg-primary text-primary-foreground"
            >
              {copiedLink ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span>{copiedLink ? t.dashboard.copied : t.dashboard.copyLink}</span>
            </Button>
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 rounded-3xl border border-border/70 text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">{messages.length}</p>
            <p className="text-[11px] text-muted-foreground">{t.dashboard.totalMessages}</p>
          </Card>
          <Card className="p-4 rounded-3xl border border-border/70 text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {messages.length}
            </p>
            <p className="text-[11px] text-muted-foreground">{t.dashboard.received}</p>
          </Card>
          <Card className="p-4 rounded-3xl border border-border/70 text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-teal-600 dark:text-teal-400">
              {photosCount}
            </p>
            <p className="text-[11px] text-muted-foreground">{t.dashboard.withAttachments}</p>
          </Card>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Tab Filter */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                filterType === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.dashboard.filterAll} ({messages.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("photos")}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                filterType === "photos"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ImageIcon className="size-3" />
              <span>{t.dashboard.filterWithPhotos} ({photosCount})</span>
            </button>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.dashboard.searchPlaceholder}
                className="h-9 ps-8 text-xs"
              />
              <Search className="size-3.5 text-muted-foreground absolute start-2.5 top-2.5" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => loadMessages(true)}
              disabled={refreshing || loading}
              className="size-9 rounded-2xl"
              title="Refresh"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="space-y-4 pt-2">
          {loading ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs">
                {lang === "ar" ? "جاري تحميل رسائلك..." : "Loading messages..."}
              </p>
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredMessages.map((msg) => (
                <MessageCard
                  key={msg.id || msg._id}
                  message={msg}
                  onDeleted={handleMessageDeleted}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <Card className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center rounded-[2.2rem] border-dashed border-2 border-border/80">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-muted/60 text-muted-foreground mb-4">
                <Inbox className="size-8 stroke-[1.5]" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                {searchQuery ? (lang === "ar" ? "لا توجد نتائج مطابقة" : "No matching messages") : t.dashboard.noMessagesTitle}
              </h3>
              <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
                {searchQuery
                  ? (lang === "ar" ? "جرّب البحث بكلمة أخرى" : "Try searching for a different word")
                  : t.dashboard.noMessagesSub}
              </p>
              {!searchQuery ? (
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  className="mt-6 h-10 gap-2 rounded-2xl px-6 text-xs font-semibold bg-primary text-primary-foreground"
                >
                  <Share2 className="size-3.5" />
                  <span>{t.dashboard.copyLink}</span>
                </Button>
              ) : null}
            </Card>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {user ? (
        <QrDialog
          open={qrOpen}
          onOpenChange={setQrOpen}
          username={user.username}
        />
      ) : null}
    </div>
  )
}
