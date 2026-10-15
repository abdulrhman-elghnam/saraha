"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { UserSearchDialog } from "@/components/user-search-dialog"
import { QrDialog } from "@/components/profile/qr-dialog"
import { getAssetUrl } from "@/lib/api"
import {
  MessageSquare,
  Search,
  Sparkles,
  Sun,
  Moon,
  Globe,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Settings,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Inbox,
} from "lucide-react"
import { toast } from "sonner"

export function Navbar() {
  const {
    user,
    isAuthenticated,
    lang,
    setLanguage,
    t,
    openAuthModal,
    openSettings,
    logout,
  } = useAuth()

  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  const userPublicUrl = user ? `${origin}/u/${user.username}` : ""

  const handleCopyMyLink = async () => {
    if (!userPublicUrl) return
    try {
      await navigator.clipboard.writeText(userPublicUrl)
      setCopiedLink(true)
      toast.success(t.nav.copiedLink)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "ar" : "en"
    setLanguage(nextLang)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const initials = (user?.fullName || user?.username || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 text-white shadow-md shadow-emerald-500/20 transition group-hover:scale-105 group-hover:shadow-emerald-500/30">
                <MessageSquare className="size-5 fill-white/20" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                    Saraha
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                    صراحة
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  {lang === "ar" ? "رسائل سرية وصادقة" : "Anonymous Feedback"}
                </span>
              </div>
            </Link>
          </div>

          {/* Right Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search User button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="h-9 gap-1.5 rounded-2xl px-2.5 text-xs text-muted-foreground hover:text-foreground"
              title={t.nav.findUser}
            >
              <Search className="size-4" />
              <span className="hidden md:inline">{t.nav.findUser}</span>
            </Button>

            {/* Language Switcher */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={toggleLanguage}
              className="size-9 rounded-2xl text-muted-foreground hover:text-foreground"
              title={lang === "en" ? "تغيير للعربية" : "Switch to English"}
            >
              <Globe className="size-4" />
              <span className="sr-only">Toggle Language</span>
            </Button>

            {/* Theme Switcher */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              className="size-9 rounded-2xl text-muted-foreground hover:text-foreground"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              <span className="sr-only">Toggle Theme</span>
            </Button>

            {/* Auth Dependent Controls */}
            {isAuthenticated && user ? (
              <>
                {/* Inbox / Dashboard link */}
                <Link href="/dashboard">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5 rounded-2xl px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    title={t.nav.inbox}
                  >
                    <Inbox className="size-4" />
                    <span className="hidden sm:inline">{t.nav.inbox}</span>
                  </Button>
                </Link>

                {/* Fast Share Link Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyMyLink}
                  className="hidden sm:flex h-9 gap-1.5 rounded-2xl border-emerald-500/30 bg-emerald-500/5 px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                >
                  {copiedLink ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  <span>{copiedLink ? t.dashboard.copied : t.nav.myLink}</span>
                </Button>

                {/* QR Code quick trigger */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setQrOpen(true)}
                  className="hidden sm:flex size-9 rounded-2xl text-muted-foreground hover:text-foreground"
                  title="QR Code"
                >
                  <QrCode className="size-4" />
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full p-0.5 outline-none ring-2 ring-transparent transition hover:ring-primary/30 focus-visible:ring-primary"
                    >
                      <Avatar className="size-9 border border-border shadow-sm">
                        {user.profileImage ? (
                          <AvatarImage src={getAssetUrl(user.profileImage)} alt={user.fullName} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  } />
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-3xl">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-normal px-2 py-1.5">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold leading-none">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground leading-none">@{user.username}</p>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <Link href="/dashboard" className="block w-full">
                        <DropdownMenuItem className="cursor-pointer gap-2 rounded-2xl text-xs py-2">
                          <Inbox className="size-3.5" />
                          <span>{t.nav.inbox}</span>
                        </DropdownMenuItem>
                      </Link>

                      <DropdownMenuItem
                        onClick={() => window.open(`/u/${user.username}`, "_blank")}
                        className="cursor-pointer gap-2 rounded-2xl text-xs py-2"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>{lang === "ar" ? "عرض صفحتي العامة" : "View Public Page"}</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={handleCopyMyLink}
                        className="cursor-pointer gap-2 rounded-2xl text-xs py-2"
                      >
                        <Copy className="size-3.5" />
                        <span>{t.dashboard.copyLink}</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setQrOpen(true)}
                        className="cursor-pointer gap-2 rounded-2xl text-xs py-2"
                      >
                        <QrCode className="size-3.5" />
                        <span>{t.dashboard.qrCode}</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={openSettings}
                        className="cursor-pointer gap-2 rounded-2xl text-xs py-2"
                      >
                        <Settings className="size-3.5" />
                        <span>{t.nav.settings}</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => logout("SINGLE")}
                        className="cursor-pointer gap-2 rounded-2xl text-xs py-2 text-destructive focus:text-destructive"
                      >
                        <LogOut className="size-3.5" />
                        <span>{t.nav.signOut}</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuthModal("signin")}
                  className="h-9 rounded-2xl px-3 text-xs font-medium"
                >
                  {t.nav.signIn}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => openAuthModal("signup")}
                  className="h-9 rounded-2xl bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
                >
                  {t.nav.getStarted}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* User Search Dialog */}
      <UserSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* QR Dialog */}
      {user ? (
        <QrDialog
          open={qrOpen}
          onOpenChange={setQrOpen}
          username={user.username}
        />
      ) : null}
    </>
  )
}
