"use client"

import React, { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { api, getAssetUrl } from "@/lib/api"
import {
  Camera,
  LogOut,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  Sparkles,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

export function SettingsDialog() {
  const { user, lang, t, settingsOpen, closeSettings, logout, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  if (!user) return null

  const handleAvatarPick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error(lang === "ar" ? "يرجى اختيار ملف صورة صالح" : "Please select a valid image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(lang === "ar" ? "حجم الصورة كبير جداً (الأقصى 5 ميغابايت)" : "File too large (max 5MB)")
      return
    }

    setIsUploading(true)
    try {
      await api.user.updateAvatar(file)
      await refreshUser()
      toast.success(
        lang === "ar"
          ? "تم تحديث الصورة الشخصية بنجاح!"
          : "Profile picture updated successfully!"
      )
    } catch (err: any) {
      toast.error(err.message || "Failed to update avatar")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleLogout = async (action: "SINGLE" | "ALL") => {
    setLoggingOut(true)
    try {
      await logout(action)
    } finally {
      setLoggingOut(false)
    }
  }

  const initials = (user.fullName || user.username || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  return (
    <Dialog open={settingsOpen} onOpenChange={closeSettings}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserIcon className="size-4" />
            </div>
            <div>
              <DialogTitle>{t.settings.title}</DialogTitle>
              <DialogDescription>{t.settings.desc}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Avatar Upload Section */}
          <div className="flex items-center gap-4 rounded-3xl border border-border/80 bg-muted/30 p-4">
            <div className="relative group cursor-pointer" onClick={handleAvatarPick}>
              <Avatar className="size-16 border-2 border-background shadow-md">
                {user.profileImage ? (
                  <AvatarImage src={getAssetUrl(user.profileImage)} alt={user.fullName} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                {isUploading ? (
                  <Loader2 className="size-5 animate-spin text-white" />
                ) : (
                  <Camera className="size-5 text-white" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{user.fullName}</h4>
              <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAvatarPick}
                disabled={isUploading}
                className="mt-2 h-7 rounded-xl text-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-3 animate-spin me-1" />
                    <span>{t.settings.uploading}</span>
                  </>
                ) : (
                  <>
                    <Camera className="size-3 me-1" />
                    <span>{lang === "ar" ? "تغيير الصورة" : "Change Avatar"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* User Details Details */}
          <div className="space-y-3 rounded-3xl border border-border/60 bg-card p-4 text-xs">
            <h5 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
              {t.settings.personalInfo}
            </h5>

            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-3.5" />
                <span>{t.auth.email}</span>
              </span>
              <span className="font-medium text-foreground">{user.email}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="size-3.5" />
                <span>{t.auth.gender}</span>
              </span>
              <span className="font-medium text-foreground">
                {user.gender === "MALE" ? t.auth.male : t.auth.female}
              </span>
            </div>

            {formattedDate ? (
              <>
                <Separator />
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>{t.settings.joined}</span>
                  </span>
                  <span className="font-medium text-foreground">{formattedDate}</span>
                </div>
              </>
            ) : null}
          </div>

          {/* Sessions & Logout */}
          <div className="space-y-2 pt-1">
            <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {t.settings.sessions}
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleLogout("SINGLE")}
                disabled={loggingOut}
                className="h-10 justify-start rounded-2xl text-xs gap-2"
              >
                <LogOut className="size-3.5 text-muted-foreground" />
                <span>{t.settings.signOutSingle}</span>
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleLogout("ALL")}
                disabled={loggingOut}
                className="h-10 justify-start rounded-2xl text-xs gap-2"
              >
                <Shield className="size-3.5" />
                <span>{t.settings.signOutAll}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
