import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import NextAuth, { type NextAuthOptions } from "next-auth"

export const runtime = "nodejs"

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "http://127.0.0.1:3000"
}

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "development-secret"
}

const apiBaseUrl = process.env.AUTH_API_URL || "http://127.0.0.1:9090"

function isSuccessfulResponse(payload: unknown): payload is { success: true } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    payload.success === true
  )
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim()
        const password = credentials?.password

        if (!email || typeof password !== "string" || password.length === 0) {
          return null
        }

        const response = await fetch(`${apiBaseUrl}/authentication/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en",
          },
          body: JSON.stringify({ email, password }),
          cache: "no-store",
        })
        const payload: unknown = await response.json()

        if (!response.ok || !isSuccessfulResponse(payload)) return null

        return { id: email, email }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== "google") return true
      if (!account.id_token) {
        console.error("[auth] Google OAuth response did not include an ID token")
        return false
      }

      const response = await fetch(
        `${apiBaseUrl}/authentication/google-credential`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en",
          },
          body: JSON.stringify({ idToken: account.id_token }),
          cache: "no-store",
        }
      )
      const payload: unknown = await response.json()

      if (!response.ok || !isSuccessfulResponse(payload)) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "message" in payload &&
          typeof payload.message === "string"
            ? payload.message
            : undefined
        const stack =
          process.env.NODE_ENV !== "production" &&
          typeof payload === "object" &&
          payload !== null &&
          "stack" in payload &&
          typeof payload.stack === "string"
            ? payload.stack
            : undefined
        console.error("[auth] Google sign-in API rejected request", {
          status: response.status,
          message,
          stack,
        })
        return false
      }

      return true
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
