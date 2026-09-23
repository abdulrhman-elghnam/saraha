import { GoogleAuthForm } from "@/components/google-auth-form"

export default function Page() {
  return (
    <main className="auth-shell">
      <div className="auth-visual" aria-hidden="true">
        <div className="visual-copy">
          <span className="visual-mark">s</span>
          <p>Messages without the performance.</p>
          <span className="visual-line" />
          <small>your words, in your own time</small>
        </div>
        <div className="visual-stamp">EST. 2026</div>
      </div>
      <GoogleAuthForm />
    </main>
  )
}
