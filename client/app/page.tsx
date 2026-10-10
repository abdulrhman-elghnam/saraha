"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { getProviders, signIn } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [hasGoogleProvider, setHasGoogleProvider] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    let isActive = true

    getProviders()
      .then((providers) => {
        if (isActive) setHasGoogleProvider(Boolean(providers?.google))
      })
      .catch(() => {
        if (isActive) setError("Unable to load sign-in options. Please reload.")
      })

    return () => {
      isActive = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "That email and password combination wasn't recognized."
            : "We couldn't sign you in. Please try again."
        )
      } else {
        setIsSignedIn(true)
      }
    } catch {
      setError("Unable to reach the sign-in service. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-svh bg-white lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#f6f4f0] p-10 lg:flex xl:p-14">
        <div className="absolute -right-28 top-1/4 size-96 rounded-full bg-[#ff6b36]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 size-96 rounded-full bg-[#ff6b36]/10 blur-3xl" />

        <Link href="/" aria-label="CodeRabbit home" className="relative z-10 w-fit">
          <Image
            src="/coderabbit-logo.png"
            alt="CodeRabbit"
            width={620}
            height={96}
            priority
            className="h-auto w-[220px]"
          />
        </Link>

        <div className="relative z-10 max-w-xl py-16">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e9e4dc] bg-white/75 px-3.5 py-2 text-xs font-medium text-[#625e58] shadow-sm">
            <span className="size-2 rounded-full bg-[#ff6b36]" />
            Your AI-powered code review
          </div>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#191817] xl:text-6xl">
            Ship better code.
            <br />
            <span className="text-[#f26332]">Together.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#68645e]">
            Sign in to pick up where your team left off and bring thoughtful
            reviews into every pull request.
          </p>

          <div className="mt-14 rounded-2xl border border-[#e9e4dc] bg-white/80 p-5 shadow-[0_16px_48px_-32px_rgba(37,31,23,0.3)]">
            <div className="flex items-center gap-1.5" aria-label="Five stars">
              {Array.from({ length: 5 }, (_, index) => (
                <svg
                  key={index}
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="size-4 fill-[#f26332]"
                >
                  <path d="m10 1.7 2.55 5.17 5.7.83-4.12 4.02.97 5.68L10 14.72l-5.1 2.68.97-5.68L1.75 7.7l5.7-.83L10 1.7Z" />
                </svg>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-[#494641]">
              “It feels like having a thoughtful teammate looking at every
              change, so we can focus on building.”
            </p>
            <p className="mt-3 text-xs font-medium text-[#88827a]">
              Built for teams who care about quality
            </p>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#89847d]">
          © {new Date().getFullYear()} CodeRabbit. All rights reserved.
        </p>
      </section>

      <section className="flex min-h-svh items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 lg:hidden">
            <Image
              src="/coderabbit-logo.png"
              alt="CodeRabbit"
              width={620}
              height={96}
              priority
              className="h-auto w-[190px]"
            />
          </div>

          <div className="mb-9">
            <p className="mb-3 text-sm font-medium text-[#f26332]">
              Welcome back
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-[#191817]">
              Sign in to your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#77736d]">
              Enter your details below to continue to CodeRabbit.
            </p>
          </div>

          {isSignedIn ? (
            <div
              role="status"
              className="rounded-xl border border-[#cde8d6] bg-[#f1faf4] p-5 text-sm leading-6 text-[#245f39]"
            >
              You&apos;re signed in successfully.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#292724]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="h-12 w-full rounded-xl border border-[#e5e2dc] bg-white px-4 text-sm text-[#242321] outline-none transition placeholder:text-[#aaa69f] focus:border-[#f26332] focus:ring-4 focus:ring-[#f26332]/10"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#292724]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-[#e5e2dc] bg-white px-4 pr-12 text-sm text-[#242321] outline-none transition placeholder:text-[#aaa69f] focus:border-[#f26332] focus:ring-4 focus:ring-[#f26332]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#8b8780] transition hover:text-[#35322e] focus-visible:outline-2 focus-visible:outline-offset-[-5px] focus-visible:outline-[#f26332]"
                  >
                    {showPassword ? (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="size-5 fill-none stroke-current"
                        strokeWidth="1.7"
                      >
                        <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 9 4.7 9 7a7.7 7.7 0 0 1-2.2 3.5M6.2 6.3C3.9 7.8 3 10.3 3 12c0 2.3 3.8 7 9 7 1.2 0 2.3-.3 3.3-.8" />
                      </svg>
                    ) : (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="size-5 fill-none stroke-current"
                        strokeWidth="1.7"
                      >
                        <path d="M3 12s3.3-7 9-7 9 7 9 7-3.3 7-9 7-9-7-9-7Z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="rounded-lg bg-[#fff2ee] px-3.5 py-3 text-sm text-[#a43f22]"
                >
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl bg-[#f26332] text-sm font-semibold text-white shadow-[0_6px_16px_-8px_rgba(242,99,50,0.8)] hover:bg-[#df5528] focus-visible:ring-[#f26332]/30"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
                {!isSubmitting ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="ml-1 size-4 fill-none stroke-current"
                    strokeWidth="1.8"
                  >
                    <path d="M4 10h12m-5-5 5 5-5 5" />
                  </svg>
                ) : null}
              </Button>
              {hasGoogleProvider ? (
                <>
                  <div className="flex items-center gap-4 py-1">
                    <span className="h-px flex-1 bg-[#e9e6e0]" />
                    <span className="text-xs text-[#96918a]">or continue with</span>
                    <span className="h-px flex-1 bg-[#e9e6e0]" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setError("")
                      void signIn("google", { callbackUrl: "/" })
                    }}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e5e2dc] bg-white text-sm font-medium text-[#34312d] transition hover:bg-[#faf9f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f26332]"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 48 48"
                      className="size-[18px]"
                    >
                      <path
                        fill="#4285F4"
                        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.8a20 20 0 0 0 0 17.6l6.8-5.3Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.8 15.2l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </>
              ) : null}
              <p className="text-center text-xs leading-5 text-[#908b84]">
                Your sign-in is securely handled by CodeRabbit.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
