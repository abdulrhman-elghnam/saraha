"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function GoogleAuthForm() {
  const [mode, setMode] = useState<"signup" | "login">("signup")
  const [message, setMessage] = useState("")

  const handleGoogleSignIn = () => {
    void signIn("google", { callbackUrl: "/" })
  }

  return (
    <section className="auth-panel">
      <div className="auth-panel__topline">
        <span className="eyebrow">Saraha / private notes</span>
        <span className="status-dot">secure access</span>
      </div>

      <div className="auth-panel__content">
        <p className="auth-kicker">{mode === "signup" ? "Start a quieter inbox" : "Welcome back"}</p>
        <h1>{mode === "signup" ? "Say what you mean." : "Your inbox is waiting."}</h1>
        <p className="auth-intro">
          {mode === "signup"
            ? "Create your private space for honest messages, thoughtful replies, and the conversations that matter."
            : "Continue to your private space and pick up where the conversation left off."}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            className={mode === "signup" ? "is-active" : ""}
            onClick={() => setMode("signup")}
            role="tab"
            aria-selected={mode === "signup"}
          >
            Create account
          </button>
          <button
            className={mode === "login" ? "is-active" : ""}
            onClick={() => setMode("login")}
            role="tab"
            aria-selected={mode === "login"}
          >
            Sign in
          </button>
        </div>

        <div className="google-action">
          <button
            className="google-button"
            type="button"
            onClick={handleGoogleSignIn}
          >
            <span className="google-g">G</span>
            {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
          </button>
        </div>

        {message && <p className="form-message" role="status">{message}</p>}

        <p className="terms">
          By continuing, you agree to keep this space respectful and private.
        </p>
      </div>

      <div className="auth-panel__footer">
        <span>Built for honest conversations</span>
        <Button variant="ghost" size="sm" onClick={() => setMessage("Your data stays yours.")}>
          Privacy first
        </Button>
      </div>
    </section>
  )
}