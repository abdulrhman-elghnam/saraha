import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== "google" || !account.id_token) {
        return true
      }

      const response = await fetch(`${process.env.AUTH_API_URL}/authentication/google-signUp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: account.id_token }),
      })

      return response.ok
    },
  },
})