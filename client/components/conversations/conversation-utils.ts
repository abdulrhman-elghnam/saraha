import type { Language } from "@/lib/translations"

export function initialsOf(name?: string | null) {
  return (name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const locale = (lang: Language) => (lang === "ar" ? "ar-EG" : "en-US")

/** "14:05" for today, "Mon" within a week, otherwise "12 Nov". */
export function formatListTime(iso: string | undefined, lang: Language) {
  if (!iso) return ""
  const date = new Date(iso)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) {
    return date.toLocaleTimeString(locale(lang), {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  const withinWeek = now.getTime() - date.getTime() < 6 * 24 * 60 * 60 * 1000
  if (withinWeek) {
    return date.toLocaleDateString(locale(lang), { weekday: "short" })
  }
  return date.toLocaleDateString(locale(lang), {
    day: "numeric",
    month: "short",
  })
}

export function formatMessageTime(iso: string, lang: Language) {
  const date = new Date(iso)
  const sameDay = date.toDateString() === new Date().toDateString()
  return date.toLocaleString(locale(lang), {
    hour: "2-digit",
    minute: "2-digit",
    ...(sameDay ? {} : { day: "numeric", month: "short" }),
  })
}
