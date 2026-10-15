"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Loader2,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"

export function AuthModal() {
  const {
    authModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    pendingVerifyEmail,
    setPendingVerifyEmail,
    login,
    refreshUser,
    lang,
    t,
  } = useAuth()

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [signInLoading, setSignInLoading] = useState(false)
  const [signInError, setSignInError] = useState("")

  // Sign Up fields
  const [signUpFullName, setSignUpFullName] = useState("")
  const [signUpUsername, setSignUpUsername] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
  const [signUpGender, setSignUpGender] = useState<"MALE" | "FEMALE">("MALE")
  const [signUpPhone, setSignUpPhone] = useState("")
  const [signUpDOB, setSignUpDOB] = useState("2000-01-01")
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [signUpLoading, setSignUpLoading] = useState(false)
  const [signUpError, setSignUpError] = useState("")

  // Verify fields
  const [verifyEmailInput, setVerifyEmailInput] = useState("")
  const [verifyOtp, setVerifyOtp] = useState("")
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resendingOtp, setResendingOtp] = useState(false)
  const [verifyError, setVerifyError] = useState("")

  useEffect(() => {
    if (pendingVerifyEmail) {
      setVerifyEmailInput(pendingVerifyEmail)
    }
  }, [pendingVerifyEmail])

  // Demo account filler
  const handleFillDemo = () => {
    setSignInEmail("abdulrhman.mohamed.atya@gmail.com")
    setSignInPassword("@Aa334455")
    setSignInError("")
  }

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInError("")
    setSignInLoading(true)
    try {
      await login({
        email: signInEmail.trim(),
        password: signInPassword,
      })
    } catch (err: any) {
      setSignInError(err.message || "Failed to sign in")
    } finally {
      setSignInLoading(false)
    }
  }

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpError("")

    // Basic client checks matching backend zod schema
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError(
        lang === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match"
      )
      return
    }

    if (signUpPassword.length < 8) {
      setSignUpError(
        lang === "ar"
          ? "كلمة المرور يجب ألا تقل عن 8 أحرف"
          : "Password must be at least 8 characters"
      )
      return
    }

    setSignUpLoading(true)
    try {
      await api.auth.signUp({
        fullName: signUpFullName.trim(),
        username: signUpUsername.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        confirmPassword: signUpConfirmPassword,
        gender: signUpGender,
        phoneNumber: signUpPhone.trim(),
        DOB: signUpDOB,
      })

      toast.success(
        lang === "ar"
          ? "تم إنشاء الحساب بنجاح! تم إرسال رمز التحقق إلى بريدك"
          : "Account created! A verification code was sent to your email"
      )
      setPendingVerifyEmail(signUpEmail.trim())
      setVerifyEmailInput(signUpEmail.trim())
      openAuthModal("verify", signUpEmail.trim())
    } catch (err: any) {
      setSignUpError(err.message || "Failed to create account")
    } finally {
      setSignUpLoading(false)
    }
  }

  // Handle OTP Verify
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyError("")
    setVerifyLoading(true)
    try {
      await api.auth.verifyEmail({
        email: verifyEmailInput.trim(),
        otp: verifyOtp.trim(),
      })

      toast.success(
        lang === "ar"
          ? "تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول"
          : "Email verified successfully! You can now sign in"
      )
      // Switch back to signin tab with prefilled email
      setSignInEmail(verifyEmailInput.trim())
      openAuthModal("signin")
    } catch (err: any) {
      setVerifyError(err.message || "Invalid or expired verification code")
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!verifyEmailInput.trim()) {
      toast.error(lang === "ar" ? "يرجى كتابة البريد الإلكتروني" : "Please enter your email")
      return
    }
    setResendingOtp(true)
    try {
      await api.auth.sendVerifyEmail(verifyEmailInput.trim())
      toast.success(t.auth.resendOtpSuccess)
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code")
    } finally {
      setResendingOtp(false)
    }
  }

  return (
    <Dialog open={authModalOpen} onOpenChange={closeAuthModal}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {authModalTab === "verify"
                  ? t.auth.verifyTitle
                  : authModalTab === "signup"
                    ? t.auth.signUpTitle
                    : t.auth.signInTitle}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {authModalTab === "verify"
                  ? t.auth.verifyDesc
                  : authModalTab === "signup"
                    ? t.auth.signUpDesc
                    : t.auth.signInDesc}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {authModalTab === "verify" ? (
          /* OTP Verification Screen */
          <form onSubmit={handleVerify} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="verify-email" className="text-xs font-medium">
                {t.auth.email}
              </Label>
              <div className="relative">
                <Input
                  id="verify-email"
                  type="email"
                  required
                  value={verifyEmailInput}
                  onChange={(e) => setVerifyEmailInput(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  className="h-10 ps-9 text-sm"
                />
                <Mail className="size-4 text-muted-foreground absolute start-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="verify-otp" className="text-xs font-medium">
                {t.auth.otp}
              </Label>
              <div className="relative">
                <Input
                  id="verify-otp"
                  type="text"
                  maxLength={6}
                  required
                  value={verifyOtp}
                  onChange={(e) => setVerifyOtp(e.target.value)}
                  placeholder="000000"
                  className="h-12 tracking-widest text-center text-lg font-mono font-bold"
                  autoFocus
                />
              </div>
            </div>

            {verifyError ? (
              <p className="rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive">
                {verifyError}
              </p>
            ) : null}

            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                disabled={verifyLoading || verifyOtp.length < 4}
                className="w-full h-10 rounded-2xl text-xs font-semibold gap-1.5"
              >
                {verifyLoading ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
                <span>{t.auth.submitVerify}</span>
              </Button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendingOtp}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {resendingOtp ? "Sending..." : t.auth.resendOtp}
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {t.auth.haveAccount}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Sign In & Sign Up Tabs */
          <Tabs
            value={authModalTab}
            onValueChange={(val) => openAuthModal(val as "signin" | "signup")}
            className="w-full pt-1"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-2xl h-10 p-1 bg-muted/60">
              <TabsTrigger value="signin" className="rounded-xl text-xs font-medium">
                {t.auth.signInTab}
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl text-xs font-medium">
                {t.auth.signUpTab}
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-4 pt-3">
              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email" className="text-xs font-medium">
                    {t.auth.email}
                  </Label>
                  <div className="relative">
                    <Input
                      id="signin-email"
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder={t.auth.emailPlaceholder}
                      className="h-10 ps-9 text-sm"
                    />
                    <Mail className="size-4 text-muted-foreground absolute start-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signin-password" className="text-xs font-medium">
                    {t.auth.password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showSignInPassword ? "text" : "password"}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder={t.auth.passwordPlaceholder}
                      className="h-10 ps-9 pe-10 text-sm"
                    />
                    <Lock className="size-4 text-muted-foreground absolute start-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute end-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showSignInPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {signInError ? (
                  <p className="rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive">
                    {signInError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={signInLoading}
                  className="w-full h-10 rounded-2xl text-xs font-semibold gap-1.5 mt-2"
                >
                  {signInLoading ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowRight className="size-3.5 rtl:rotate-180" />}
                  <span>{t.auth.submitSignIn}</span>
                </Button>
              </form>

              {/* Demo Account Button */}
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  {lang === "ar" ? "تريد تجربة سريعة للوحة التحكم؟" : "Want a quick test drive?"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFillDemo}
                  className="h-8 rounded-xl text-xs gap-1.5 w-full bg-background hover:bg-muted"
                >
                  <Sparkles className="size-3 text-amber-500" />
                  <span>{t.auth.quickDemo}</span>
                </Button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="text-xs text-muted-foreground hover:text-primary transition"
                >
                  {t.auth.noAccount}
                </button>
              </div>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-3 pt-3">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="signup-name" className="text-xs font-medium">
                      {t.auth.fullName}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-name"
                        type="text"
                        required
                        value={signUpFullName}
                        onChange={(e) => setSignUpFullName(e.target.value)}
                        placeholder="Ahmed Mohamed"
                        className="h-9 ps-8 text-xs"
                      />
                      <User className="size-3.5 text-muted-foreground absolute start-2.5 top-2.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-username" className="text-xs font-medium">
                      {t.auth.username}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-username"
                        type="text"
                        required
                        value={signUpUsername}
                        onChange={(e) => setSignUpUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        placeholder="ahmed123"
                        className="h-9 ps-8 text-xs font-mono"
                      />
                      <span className="text-xs text-muted-foreground absolute start-3 top-2 font-mono">@</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="signup-email" className="text-xs font-medium">
                    {t.auth.email}
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-email"
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder={t.auth.emailPlaceholder}
                      className="h-9 ps-8 text-xs"
                    />
                    <Mail className="size-3.5 text-muted-foreground absolute start-2.5 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="signup-password" className="text-xs font-medium">
                      {t.auth.password}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignUpPassword ? "text" : "password"}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-9 ps-8 pe-8 text-xs"
                      />
                      <Lock className="size-3.5 text-muted-foreground absolute start-2.5 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute end-2.5 top-2.5 text-muted-foreground"
                      >
                        {showSignUpPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-confirm" className="text-xs font-medium">
                      {t.auth.confirmPassword}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm"
                        type={showSignUpPassword ? "text" : "password"}
                        required
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-9 ps-8 text-xs"
                      />
                      <Lock className="size-3.5 text-muted-foreground absolute start-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">{t.auth.gender}</Label>
                    <select
                      value={signUpGender}
                      onChange={(e) => setSignUpGender(e.target.value as "MALE" | "FEMALE")}
                      className="h-9 w-full rounded-2xl border border-input bg-background px-3 text-xs outline-none"
                    >
                      <option value="MALE">{t.auth.male}</option>
                      <option value="FEMALE">{t.auth.female}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-phone" className="text-xs font-medium">
                      {t.auth.phoneNumber}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-phone"
                        type="tel"
                        required
                        value={signUpPhone}
                        onChange={(e) => setSignUpPhone(e.target.value)}
                        placeholder="01008261140"
                        className="h-9 ps-8 text-xs"
                      />
                      <Phone className="size-3.5 text-muted-foreground absolute start-2.5 top-2.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-dob" className="text-xs font-medium">
                      {t.auth.dob}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-dob"
                        type="date"
                        required
                        value={signUpDOB}
                        onChange={(e) => setSignUpDOB(e.target.value)}
                        className="h-9 ps-8 text-xs"
                      />
                      <Calendar className="size-3.5 text-muted-foreground absolute start-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-normal">
                  {t.auth.passwordHint}
                </p>

                {signUpError ? (
                  <p className="rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive">
                    {signUpError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={signUpLoading}
                  className="w-full h-10 rounded-2xl text-xs font-semibold gap-1.5 mt-2"
                >
                  {signUpLoading ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                  <span>{t.auth.submitSignUp}</span>
                </Button>
              </form>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  className="text-xs text-muted-foreground hover:text-primary transition"
                >
                  {t.auth.haveAccount}
                </button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
