"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import {
  api,
  User,
  getStoredAccessToken,
  getCurrentLang,
  setCurrentLang,
  clearStoredTokens,
} from "./api"
import { translations, Language, TranslationSchema } from "./translations"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  loading: boolean
  lang: Language
  t: TranslationSchema
  isAuthenticated: boolean
  authModalOpen: boolean
  authModalTab: "signin" | "signup" | "verify"
  pendingVerifyEmail: string
  settingsOpen: boolean
  qrOpen: boolean
  setLanguage: (lang: Language) => void
  openAuthModal: (tab?: "signin" | "signup" | "verify", email?: string) => void
  closeAuthModal: () => void
  setPendingVerifyEmail: (email: string) => void
  openSettings: () => void
  closeSettings: () => void
  openQr: () => void
  closeQr: () => void
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: (action?: "SINGLE" | "ALL") => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLangState] = useState<Language>("en")

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup" | "verify">("signin")
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState("")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const refreshUser = useCallback(async () => {
    const token = getStoredAccessToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const profile = await api.user.getProfile()
      setUser(profile || null)
    } catch (err: any) {
      console.warn("Failed to load user profile:", err.message)
      if (err.status === 401 || err.status === 403) {
        clearStoredTokens()
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const savedLang = getCurrentLang()
    setLangState(savedLang)
    if (typeof document !== "undefined") {
      document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr"
      document.documentElement.lang = savedLang
    }
    refreshUser()
  }, [refreshUser])

  const setLanguage = (newLang: Language) => {
    setLangState(newLang)
    setCurrentLang(newLang)
    if (typeof document !== "undefined") {
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr"
      document.documentElement.lang = newLang
    }
  }

  const openAuthModal = (tab: "signin" | "signup" | "verify" = "signin", email?: string) => {
    setAuthModalTab(tab)
    if (email) setPendingVerifyEmail(email)
    setAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setAuthModalOpen(false)
  }

  const openSettings = () => setSettingsOpen(true)
  const closeSettings = () => setSettingsOpen(false)

  const openQr = () => setQrOpen(true)
  const closeQr = () => setQrOpen(false)

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true)
    try {
      await api.auth.login(credentials)
      const profile = await api.user.getProfile()
      setUser(profile || null)
      setAuthModalOpen(false)
      toast.success(
        lang === "ar" ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!"
      )
    } catch (err: any) {
      // If email is not verified (code 408), route straight to verify
      if (err.status === 409 || err.payload?.cause?.messageCode === 408) {
        setPendingVerifyEmail(credentials.email)
        setAuthModalTab("verify")
        toast.info(
          lang === "ar"
            ? "يرجى تأكيد بريدك الإلكتروني لمتابعة الدخول"
            : "Please verify your email address to continue"
        )
      } else {
        toast.error(err.message || (lang === "ar" ? "فشل تسجيل الدخول" : "Login failed"))
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async (action: "SINGLE" | "ALL" = "SINGLE") => {
    try {
      await api.auth.logout(action)
    } catch (err) {
      console.warn("Logout error:", err)
    } finally {
      setUser(null)
      closeSettings()
      toast.info(
        lang === "ar"
          ? action === "ALL"
            ? "تم تسجيل الخروج من جميع الأجهزة"
            : "تم تسجيل الخروج"
          : action === "ALL"
            ? "Signed out from all devices"
            : "Signed out"
      )
    }
  }

  const t = translations[lang]

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        lang,
        t,
        isAuthenticated: Boolean(user),
        authModalOpen,
        authModalTab,
        pendingVerifyEmail,
        settingsOpen,
        qrOpen,
        setLanguage,
        openAuthModal,
        closeAuthModal,
        setPendingVerifyEmail,
        openSettings,
        closeSettings,
        openQr,
        closeQr,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
