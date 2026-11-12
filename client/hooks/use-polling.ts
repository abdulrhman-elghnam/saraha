"use client"

import { useEffect, useRef } from "react"

/**
 * Calls `task` every `intervalMs` while `enabled` — the app's replacement for websockets.
 *
 * - Never overlaps: the next tick is scheduled only after the previous call settles.
 * - Pauses while the browser tab is hidden and polls immediately when it becomes visible.
 * - Always calls the latest `task`, so callers don't need to memoize it.
 * - With `immediate`, also runs once as soon as polling is enabled.
 */
export function usePolling(
  task: () => Promise<unknown> | unknown,
  intervalMs: number,
  enabled = true,
  immediate = false
) {
  const taskRef = useRef(task)

  useEffect(() => {
    taskRef.current = task
  })

  useEffect(() => {
    if (!enabled) return

    let timer: ReturnType<typeof setTimeout> | undefined
    let running = false
    let stopped = false

    const schedule = () => {
      if (stopped) return
      clearTimeout(timer)
      timer = setTimeout(tick, intervalMs)
    }

    const tick = async () => {
      if (stopped || running) return
      if (document.visibilityState === "hidden") return
      running = true
      try {
        await taskRef.current()
      } catch {
        // Errors are the task's concern; keep polling.
      } finally {
        running = false
        schedule()
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer)
        tick()
      }
    }

    if (immediate) {
      tick()
    } else {
      schedule()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      stopped = true
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [intervalMs, enabled, immediate])
}
