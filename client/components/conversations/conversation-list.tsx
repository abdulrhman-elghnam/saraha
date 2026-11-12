"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ImageIcon, Loader2, MessagesSquare, Plus } from "lucide-react"
import { toast } from "sonner"

import { api, ConversationSummary, getAssetUrl } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useConversations } from "@/lib/conversations-context"
import { usePolling } from "@/hooks/use-polling"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatListTime, initialsOf } from "./conversation-utils"

const LIST_POLL_MS = 5_000

const activityTime = (c: ConversationSummary) =>
  new Date(c.lastMessage?.createdAt ?? c.createdAt).getTime()

export function ConversationList({ activeId }: { activeId?: string }) {
  const { user, lang, t } = useAuth()
  const { refreshUnread } = useConversations()
  const [byId, setById] = useState<Record<string, ConversationSummary>>({})
  const [loading, setLoading] = useState(true)
  const [newChatOpen, setNewChatOpen] = useState(false)
  // Server clock from the last response — avoids missing updates because of client clock skew.
  const sinceRef = useRef<string | null>(null)

  const merge = (items: ConversationSummary[]) => {
    if (!items.length) return
    setById((prev) => {
      const next = { ...prev }
      for (const item of items) next[item.id] = item
      return next
    })
  }

  useEffect(() => {
    let cancelled = false
    api.conversations
      .list({ size: 50 })
      .then((data) => {
        if (cancelled) return
        sinceRef.current = data.serverTime
        merge(data.conversations)
      })
      .catch((err) => toast.error(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  usePolling(
    async () => {
      if (!sinceRef.current) return
      const data = await api.conversations.list({
        since: sinceRef.current,
        size: 50,
      })
      sinceRef.current = data.serverTime
      if (data.conversations.length) {
        merge(data.conversations)
        refreshUnread()
      }
    },
    LIST_POLL_MS,
    !loading
  )

  const conversations = useMemo(
    () => Object.values(byId).sort((a, b) => activityTime(b) - activityTime(a)),
    [byId]
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div>
          <h1 className="font-heading text-base font-bold text-foreground">
            {t.conversations.title}
          </h1>
          <p className="text-[11px] text-muted-foreground">
            {t.conversations.subtitle}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setNewChatOpen(true)}
          className="h-8 shrink-0 gap-1 rounded-2xl text-xs"
        >
          <Plus className="size-3.5" />
          <span>{t.conversations.newChat}</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessagesSquare className="size-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {t.conversations.empty}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t.conversations.emptyHint}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {conversations.map((c) => {
              const isActive = c.id === activeId
              // The open conversation is being read right now; don't flash a stale badge.
              const unread = isActive ? 0 : c.unreadCount
              const mine = c.lastMessage?.senderId === user?.id
              const preview = c.lastMessage
                ? c.lastMessage.content ||
                  (c.lastMessage.hasAttachments ? t.conversations.photo : "")
                : t.conversations.sayHi
              return (
                <li key={c.id}>
                  <Link
                    href={`/conversations/${c.id}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition hover:bg-muted/60",
                      isActive && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <Avatar className="size-10 border border-border">
                      {c.participant?.profileImage ? (
                        <AvatarImage
                          src={getAssetUrl(c.participant.profileImage)}
                          alt={c.participant.fullName}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {initialsOf(c.participant?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm text-foreground",
                            unread > 0 ? "font-bold" : "font-medium"
                          )}
                        >
                          {c.participant?.fullName ?? "—"}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatListTime(
                            c.lastMessage?.createdAt ?? c.createdAt,
                            lang
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "flex min-w-0 items-center gap-1 truncate text-xs",
                            unread > 0
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {mine ? (
                            <span className="shrink-0">
                              {t.conversations.you}:
                            </span>
                          ) : null}
                          {c.lastMessage?.hasAttachments &&
                          !c.lastMessage.content ? (
                            <ImageIcon className="size-3 shrink-0" />
                          ) : null}
                          <span dir="auto" className="truncate">
                            {preview}
                          </span>
                        </span>
                        {unread > 0 ? (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
    </div>
  )
}

function NewChatDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const { t } = useAuth()
  const [username, setUsername] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = username.trim().replace(/^@/, "")
    if (!clean) return
    setSubmitting(true)
    try {
      const target = await api.user.getPublicProfile(clean)
      if (!target) throw new Error(t.conversations.notFound)
      const conversation = await api.conversations.start(target.id)
      onOpenChange(false)
      setUsername("")
      router.push(`/conversations/${conversation.id}`)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.conversations.newChatTitle}</DialogTitle>
          <DialogDescription>{t.conversations.newChatDesc}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t.conversations.usernamePlaceholder}
            className="h-10 rounded-2xl"
          />
          <Button
            type="submit"
            disabled={submitting || !username.trim()}
            className="h-10 rounded-2xl text-xs font-semibold"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t.conversations.start
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
