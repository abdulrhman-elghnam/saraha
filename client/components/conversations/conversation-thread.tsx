"use client"

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Camera,
  CheckCheck,
  Loader2,
  MessageSquareOff,
  Send,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import {
  api,
  ConversationMessage,
  ConversationSummary,
  getAssetUrl,
} from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useConversations } from "@/lib/conversations-context"
import { usePolling } from "@/hooks/use-polling"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatMessageTime, initialsOf } from "./conversation-utils"

const MESSAGE_POLL_MS = 3_000
const PAGE_SIZE = 30
const MAX_ATTACHMENTS = 4
const NEAR_BOTTOM_PX = 120

/** Appends `incoming` to `current`, skipping ids already present (a send and a poll can race). */
function appendUnique(
  current: ConversationMessage[],
  incoming: ConversationMessage[]
) {
  const seen = new Set(current.map((m) => m._id))
  const fresh = incoming.filter((m) => !seen.has(m._id))
  return fresh.length ? [...current, ...fresh] : current
}

export function ConversationThread({
  conversationId,
}: {
  conversationId: string
}) {
  const { user, lang, t } = useAuth()
  const { refreshUnread } = useConversations()

  const [conversation, setConversation] = useState<ConversationSummary | null>(
    null
  )
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [participantLastReadAt, setParticipantLastReadAt] = useState<
    string | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)
  const prependAnchorRef = useRef<number | null>(null)

  const markRead = useCallback(async () => {
    try {
      await api.conversations.markRead(conversationId)
      refreshUnread()
    } catch {
      // Non-critical; the next poll will try again.
    }
  }, [conversationId, refreshUnread])

  // Initial load
  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.conversations.get(conversationId),
      api.conversations.messages(conversationId, { limit: PAGE_SIZE }),
    ])
      .then(([conv, page]) => {
        if (cancelled) return
        setConversation(conv)
        setMessages(page.messages)
        setHasMore(page.hasMore)
        setParticipantLastReadAt(page.participantLastReadAt)
        stickToBottomRef.current = true
        markRead()
      })
      .catch((err) => {
        if (cancelled) return
        if (err.status === 404) setNotFound(true)
        else toast.error(err.message)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [conversationId, markRead])

  // Poll for new messages and for the other person's read receipt.
  usePolling(
    async () => {
      const lastId = messages[messages.length - 1]?._id
      const page = await api.conversations.messages(
        conversationId,
        lastId ? { after: lastId, limit: 100 } : { limit: PAGE_SIZE }
      )
      setParticipantLastReadAt(page.participantLastReadAt)
      if (!page.messages.length) return

      setMessages((prev) => appendUnique(prev, page.messages))
      if (page.messages.some((m) => m.senderId !== user?.id)) {
        markRead()
      }
    },
    MESSAGE_POLL_MS,
    !loading && !notFound
  )

  // Scroll handling: keep the view pinned to the bottom unless the user scrolled up,
  // and keep the visible message in place when older history is prepended.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (prependAnchorRef.current !== null) {
      el.scrollTop = el.scrollHeight - prependAnchorRef.current
      prependAnchorRef.current = null
    } else if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
  }

  const loadOlder = async () => {
    const firstId = messages[0]?._id
    if (!firstId || loadingOlder) return
    setLoadingOlder(true)
    try {
      const page = await api.conversations.messages(conversationId, {
        before: firstId,
        limit: PAGE_SIZE,
      })
      const el = scrollRef.current
      if (el) prependAnchorRef.current = el.scrollHeight - el.scrollTop
      setMessages((prev) => [...page.messages, ...prev])
      setHasMore(page.hasMore)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoadingOlder(false)
    }
  }

  const handleSent = (message: ConversationMessage) => {
    stickToBottomRef.current = true
    setMessages((prev) => appendUnique(prev, [message]))
  }

  const handleDelete = async (messageId: string) => {
    try {
      await api.conversations.deleteMessage(conversationId, messageId)
      setMessages((prev) => prev.filter((m) => m._id !== messageId))
      toast.success(t.conversations.deleted)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound || !conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <MessageSquareOff className="size-8 text-muted-foreground" />
        <p className="text-sm font-semibold">{t.conversations.notFound}</p>
        <Link href="/conversations">
          <Button variant="outline" size="sm" className="rounded-2xl text-xs">
            {t.conversations.back}
          </Button>
        </Link>
      </div>
    )
  }

  const participant = conversation.participant
  const lastMine = [...messages].reverse().find((m) => m.senderId === user?.id)
  const lastMineSeen =
    lastMine &&
    participantLastReadAt &&
    new Date(participantLastReadAt).getTime() >=
      new Date(lastMine.createdAt).getTime()

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 px-3 py-2.5 sm:px-4">
        <Link href="/conversations" className="md:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-2xl"
            title={t.conversations.back}
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
          </Button>
        </Link>
        <Link
          href={participant ? `/u/${participant.username}` : "#"}
          className="flex min-w-0 items-center gap-3"
        >
          <Avatar className="size-9 border border-border">
            {participant?.profileImage ? (
              <AvatarImage
                src={getAssetUrl(participant.profileImage)}
                alt={participant.fullName}
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initialsOf(participant?.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {participant?.fullName ?? "—"}
            </p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              @{participant?.username}
            </p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 space-y-2 overflow-y-auto bg-muted/20 px-3 py-4 sm:px-5"
      >
        {hasMore ? (
          <div className="flex justify-center pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadOlder}
              disabled={loadingOlder}
              className="h-7 rounded-2xl text-[11px] text-muted-foreground"
            >
              {loadingOlder ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                t.conversations.loadOlder
              )}
            </Button>
          </div>
        ) : null}

        {messages.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted-foreground">
            {t.conversations.sayHi}
          </p>
        ) : null}

        {messages.map((message) => {
          const mine = message.senderId === user?.id
          return (
            <div
              key={message._id}
              className={cn(
                "group flex",
                mine ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex max-w-[80%] items-end gap-1",
                  mine && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "rounded-3xl px-3.5 py-2 text-sm shadow-sm",
                    mine
                      ? "rounded-ee-md bg-primary text-primary-foreground"
                      : "rounded-es-md border border-border bg-card text-foreground"
                  )}
                >
                  {message.attachments?.length ? (
                    <div
                      className={cn(
                        "mb-1 grid gap-1",
                        message.attachments.length > 1 && "grid-cols-2"
                      )}
                    >
                      {message.attachments.map((path) => (
                        <a
                          key={path}
                          href={getAssetUrl(path)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getAssetUrl(path)}
                            alt={t.conversations.photo}
                            className="max-h-60 w-full rounded-2xl object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  ) : null}
                  {message.content ? (
                    <p dir="auto" className="break-words whitespace-pre-wrap">
                      {message.content}
                    </p>
                  ) : null}
                  <p
                    className={cn(
                      "mt-0.5 text-end text-[10px]",
                      mine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatMessageTime(message.createdAt, lang)}
                  </p>
                </div>
                {mine ? (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(message._id)}
                    title={t.conversations.deleteMessage}
                    className="rounded-full text-muted-foreground opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <Trash2 />
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}

        {lastMineSeen ? (
          <p className="flex items-center justify-end gap-1 pe-1 text-[10px] text-muted-foreground">
            <CheckCheck className="size-3 text-primary" />
            {t.conversations.seen}
          </p>
        ) : null}
      </div>

      <MessageComposer conversationId={conversationId} onSent={handleSent} />
    </div>
  )
}

function MessageComposer({
  conversationId,
  onSent,
}: {
  conversationId: string
  onSent: (message: ConversationMessage) => void
}) {
  const { t } = useAuth()
  const [content, setContent] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  )
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews]
  )

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || [])
    if (files.length + picked.length > MAX_ATTACHMENTS) {
      toast.info(t.conversations.maxPhotos)
    }
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_ATTACHMENTS))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const send = async () => {
    const text = content.trim()
    if (!text && files.length === 0) {
      toast.error(t.conversations.emptyMessage)
      return
    }
    setSending(true)
    try {
      const message = await api.conversations.send(conversationId, {
        content: text || undefined,
        attachments: files,
      })
      onSent(message)
      setContent("")
      setFiles([])
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds a new line (skip while an IME is composing).
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        send()
      }}
      className="border-t border-border/60 bg-background px-3 py-2.5 sm:px-4"
    >
      {previews.length ? (
        <div className="mb-2 flex gap-2">
          {previews.map((url, index) => (
            <div key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="size-14 rounded-xl border border-border object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== index))
                }
                className="absolute -end-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple
          hidden
          onChange={handleFiles}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || files.length >= MAX_ATTACHMENTS}
          title={t.conversations.attach}
          className="shrink-0 rounded-2xl text-muted-foreground"
        >
          <Camera className="size-4" />
        </Button>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.conversations.messagePlaceholder}
          rows={1}
          maxLength={5000}
          className="max-h-32 min-h-9 flex-1 resize-none rounded-2xl py-2 text-sm"
        />
        <Button
          type="submit"
          size="icon"
          disabled={sending}
          title={t.conversations.send}
          className="shrink-0 rounded-2xl"
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4 rtl:-scale-x-100" />
          )}
        </Button>
      </div>
    </form>
  )
}
