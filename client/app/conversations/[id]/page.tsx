"use client"

import { useParams } from "next/navigation"
import { ConversationThread } from "@/components/conversations/conversation-thread"

export default function ConversationPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  if (!id) return null
  // `key` resets all thread state (messages, cursors, scroll) when switching conversations.
  return <ConversationThread key={id} conversationId={id} />
}
