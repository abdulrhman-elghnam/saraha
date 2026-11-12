"use client"

import React, { createContext, useCallback, useContext, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { usePolling } from "@/hooks/use-polling"

const UNREAD_POLL_MS = 15_000
const NO_UNREAD = { unreadMessages: 0, unreadConversations: 0 }

interface ConversationsContextType {
  unreadMessages: number
  unreadConversations: number
  /** Re-fetch the unread counters now (e.g. right after marking a conversation read). */
  refreshUnread: () => Promise<void>
}

const ConversationsContext = createContext<
  ConversationsContextType | undefined
>(undefined)

export function ConversationsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const [counts, setCounts] = useState({
    unreadMessages: 0,
    unreadConversations: 0,
  })

  const refreshUnread = useCallback(async () => {
    try {
      setCounts(await api.conversations.unreadCount())
    } catch {
      // Badge is best-effort; the next poll will retry.
    }
  }, [])

  // Fetch right away on sign-in, then every UNREAD_POLL_MS.
  usePolling(refreshUnread, UNREAD_POLL_MS, isAuthenticated, true)

  // Signed-out users always see zero, without needing to reset state.
  const visible = isAuthenticated ? counts : NO_UNREAD

  return (
    <ConversationsContext.Provider value={{ ...visible, refreshUnread }}>
      {children}
    </ConversationsContext.Provider>
  )
}

export function useConversations() {
  const context = useContext(ConversationsContext)
  if (!context) {
    throw new Error(
      "useConversations must be used within a ConversationsProvider"
    )
  }
  return context
}
