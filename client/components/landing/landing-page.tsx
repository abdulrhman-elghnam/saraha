"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Share2,
  Camera,
  Heart,
  MessageSquare,
  Lock,
  UserCheck,
  Send,
  EyeOff,
  Flame,
} from "lucide-react"

export function LandingPage() {
  const { lang, t, openAuthModal } = useAuth()
  const [demoLike, setDemoLike] = useState(false)

  return (
    <div className="flex flex-col gap-16 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-center">
        {/* Soft atmospheric gradient blurs in the background */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-96 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute top-48 left-1/4 -z-10 size-72 rounded-full bg-teal-500/10 blur-2xl" />

        <div className="container mx-auto max-w-4xl px-4">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs mb-6">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Heading */}
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.15]">
            {lang === "ar" ? (
              <>
                استقبل رسائل وملاحظات حقيقية{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  بسرية وصراحة تامة
                </span>
              </>
            ) : (
              <>
                Receive honest feedback from friends & coworkers{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  completely anonymously
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => openAuthModal("signup")}
              className="h-12 w-full sm:w-auto rounded-3xl bg-primary px-8 text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 gap-2"
            >
              <Sparkles className="size-4" />
              <span>{t.hero.ctaPrimary}</span>
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Button>

            <Link href="/u/ahmed123" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-full sm:w-auto rounded-3xl px-6 text-sm font-medium border-border/80 gap-2"
              >
                <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.hero.ctaSecondary}</span>
              </Button>
            </Link>
          </div>

          {/* Trust Metrics */}
          <div className="mt-12 grid grid-cols-3 divide-x divide-border/60 rounded-3xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs max-w-xl mx-auto text-center">
            <div className="px-3">
              <p className="text-xl font-bold text-foreground">100%</p>
              <p className="text-[11px] text-muted-foreground">{t.hero.statsPrivacy}</p>
            </div>
            <div className="px-3">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Zero</p>
              <p className="text-[11px] text-muted-foreground">
                {lang === "ar" ? "تتبع هوية" : "Identity Tracking"}
              </p>
            </div>
            <div className="px-3">
              <p className="text-xl font-bold text-foreground">Instant</p>
              <p className="text-[11px] text-muted-foreground">
                {lang === "ar" ? "مشاركة ستوري" : "Story Sharing"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Product Showcase Card */}
      <section className="container mx-auto max-w-4xl px-4">
        <div className="relative mx-auto max-w-lg">
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/10 blur-xl opacity-75" />

          <Card className="relative overflow-hidden rounded-[2.2rem] border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <EyeOff className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {lang === "ar" ? "رسالة سرية واردة" : "Incoming Secret Message"}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {lang === "ar" ? "قبل دقائق عبر رابط صراحة" : "Just now via Saraha Link"}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                {lang === "ar" ? "سرية 100%" : "100% Anonymous"}
              </Badge>
            </div>

            <div className="my-5 rounded-2xl bg-muted/40 p-4">
              <p className="text-sm font-medium leading-relaxed text-foreground select-none">
                {lang === "ar"
                  ? "أردت أن أقول لك أن هدوءك في المواقف الصعبة وإيجابيتك تلهم كل الفريق دائماً! استمر بنفس الشغف ✨"
                  : "I wanted to let you know that your calm leadership and positive mindset in tough projects truly inspires all of us! Keep shining ✨"}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setDemoLike(!demoLike)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                  demoLike
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-600"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <Heart className={`size-3.5 ${demoLike ? "fill-rose-500" : ""}`} />
                <span>{demoLike ? (lang === "ar" ? "أعجبك" : "Liked") : (lang === "ar" ? "إعجاب" : "Like")}</span>
              </button>

              <Button
                variant="outline"
                size="xs"
                onClick={() => openAuthModal("signup")}
                className="h-8 gap-1.5 rounded-xl text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
              >
                <Share2 className="size-3" />
                <span>{lang === "ar" ? "مشاركة كستوري إنستغرام" : "Share to Story"}</span>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="container mx-auto max-w-5xl px-4 py-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            {t.howItWorks.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-6 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
              <Sparkles className="size-6" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-2">
              {t.howItWorks.step1Title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.howItWorks.step1Desc}
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4 shadow-sm">
              <Share2 className="size-6" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-2">
              {t.howItWorks.step2Title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.howItWorks.step2Desc}
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
              <MessageSquare className="size-6" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-2">
              {t.howItWorks.step3Title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.howItWorks.step3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto max-w-5xl px-4 py-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            {t.features.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-6 rounded-3xl border border-border/70 hover:border-emerald-500/40 transition">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-3">
              <ShieldCheck className="size-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground mb-1">{t.features.f1Title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.features.f1Desc}</p>
          </Card>

          <Card className="p-6 rounded-3xl border border-border/70 hover:border-emerald-500/40 transition">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 mb-3">
              <Camera className="size-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground mb-1">{t.features.f2Title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.features.f2Desc}</p>
          </Card>

          <Card className="p-6 rounded-3xl border border-border/70 hover:border-emerald-500/40 transition">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 mb-3">
              <Flame className="size-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground mb-1">{t.features.f3Title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.features.f3Desc}</p>
          </Card>

          <Card className="p-6 rounded-3xl border border-border/70 hover:border-emerald-500/40 transition">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-3">
              <Lock className="size-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground mb-1">{t.features.f4Title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.features.f4Desc}</p>
          </Card>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="container mx-auto max-w-4xl px-4 pb-12">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-900 p-8 sm:p-12 text-center text-white shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl font-bold sm:text-4xl leading-tight">
              {lang === "ar"
                ? "جاهز لمعرفة رأي الناس الصادق فيك؟"
                : "Ready to know what people really think?"}
            </h3>
            <p className="mt-4 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {lang === "ar"
                ? "انضم الآن إلى صراحة، أنشئ رابطك في نصف دقيقة، وابدأ باستقبال المصارحات البناءة."
                : "Join Saraha now, get your personal link in 30 seconds, and start receiving candid feedback."}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => openAuthModal("signup")}
                className="h-12 w-full sm:w-auto rounded-3xl bg-white text-emerald-900 font-bold hover:bg-white/90 text-sm px-8"
              >
                {t.hero.ctaPrimary}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
