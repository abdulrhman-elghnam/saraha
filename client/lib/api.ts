export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:9090"

export interface User {
  id: string
  _id?: string
  username: string
  email: string
  fullName: string
  firstName?: string
  lastName?: string
  DOB?: string
  phoneNumber?: string
  gender: "MALE" | "FEMALE"
  profileImage?: string | null
  coverImage?: string | null
  role?: string
  emailVerifiedAt?: string | null
  createdAt?: string
}

export interface PublicUser {
  id: string
  username: string
  fullName: string
  profileImage?: string | null
  createdAt?: string
}

export interface MessageItem {
  id: string
  _id: string
  content?: string
  attachments?: string[]
  receiverId: string
  senderId?: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  accessToken?: string
  refreshToken?: string
  [key: string]: any
}

// Storage helpers
export const ACCESS_TOKEN_KEY = "saraha_access_token"
export const REFRESH_TOKEN_KEY = "saraha_refresh_token"
export const LANG_KEY = "saraha_lang"

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setStoredTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function clearStoredTokens() {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getCurrentLang(): "en" | "ar" {
  if (typeof window === "undefined") return "en"
  const lang = localStorage.getItem(LANG_KEY)
  return lang === "ar" ? "ar" : "en"
}

export function setCurrentLang(lang: "en" | "ar") {
  if (typeof window === "undefined") return
  localStorage.setItem(LANG_KEY, lang)
}

export function getAssetUrl(path?: string | null): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }
  let clean = path.replace(/^\.\//, "")
  if (clean.startsWith("/")) clean = clean.slice(1)
  return `/${clean}`
}

async function request<T = any>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`
  const lang = getCurrentLang()
  const headers = new Headers(options.headers || {})

  headers.set("Accept-Language", lang)

  const accessToken = getStoredAccessToken()
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  // If body is NOT FormData, set JSON Content-Type if not provided
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  let response = await fetch(url, {
    ...options,
    headers,
  })

  // Attempt refresh if 401 unauthorized
  if (response.status === 401 && retry) {
    const refreshToken = getStoredRefreshToken()
    if (refreshToken && accessToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/authentication/rotate-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
            Authorization: `Bearer ${refreshToken}`,
          },
          body: JSON.stringify({ expireToken: `Bearer ${accessToken}` }),
        })
        const refreshData = await refreshRes.json()
        if (refreshRes.ok && refreshData.accessToken) {
          setStoredTokens(refreshData.accessToken, refreshData.refreshToken)
          headers.set("Authorization", `Bearer ${refreshData.accessToken}`)
          response = await fetch(url, { ...options, headers })
        } else {
          clearStoredTokens()
        }
      } catch {
        clearStoredTokens()
      }
    }
  }

  const payload: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: response.statusText || "Request failed",
  }))

  if (!response.ok || payload.success === false) {
    const errorMsg = payload.message || `Request failed with status ${response.status}`
    const error = new Error(errorMsg)
    ;(error as any).status = response.status
    ;(error as any).payload = payload
    throw error
  }

  return payload
}

export const api = {
  auth: {
    signUp: (data: {
      fullName: string
      username: string
      email: string
      password: string
      confirmPassword: string
      gender: "MALE" | "FEMALE"
      phoneNumber: string
      DOB: string
    }) =>
      request("/authentication/sign-up", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    login: async (credentials: { email: string; password: string }) => {
      const res = await request<{ accessToken: string; refreshToken: string }>(
        "/authentication/login",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        },
        false
      )
      if (res.accessToken) {
        setStoredTokens(res.accessToken, res.refreshToken)
      }
      return res
    },

    sendVerifyEmail: (email: string) =>
      request("/authentication/send-verify-email", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),

    verifyEmail: (data: { email: string; otp: string }) =>
      request("/authentication/verify-email", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    logout: async (action: "SINGLE" | "ALL" = "SINGLE") => {
      try {
        await request("/authentication/logout", {
          method: "POST",
          body: JSON.stringify({ action }),
        })
      } finally {
        clearStoredTokens()
      }
    },
  },

  user: {
    getProfile: async () => {
      const res = await request<User>("/user/profile")
      return res.data
    },

    getPublicProfile: async (identifier: string) => {
      const res = await request<PublicUser>(`/user/${encodeURIComponent(identifier)}`)
      return res.data
    },

    updateAvatar: async (file: File) => {
      const formData = new FormData()
      formData.append("avatar", file)
      const res = await request<{ profileImage: string }>("/user/avatar", {
        method: "POST",
        body: formData,
      })
      return res.data
    },
  },

  messages: {
    list: async () => {
      const res = await request<{ messages: MessageItem[] }>("/message/list")
      return res.data?.messages || []
    },

    get: async (messageId: string) => {
      const res = await request<{ message: MessageItem }>(`/message/${messageId}`)
      return res.data?.message
    },

    send: async (params: {
      receiverId: string
      content?: string
      attachments?: File[]
    }) => {
      const formData = new FormData()
      if (params.content) {
        formData.append("content", params.content)
      }
      if (params.attachments && params.attachments.length > 0) {
        for (const file of params.attachments) {
          formData.append("attachments", file)
        }
      }
      const res = await request<{ message: MessageItem }>(
        `/message/${params.receiverId}`,
        {
          method: "POST",
          body: formData,
        }
      )
      return res.data?.message
    },

    delete: async (messageId: string) => {
      const res = await request<{ message: MessageItem }>(`/message/${messageId}`, {
        method: "DELETE",
      })
      return res.data?.message
    },
  },
}
