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

      try {
        const response = await fetch(`${process.env.AUTH_API_URL}/authentication/google-signUp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: account.id_token }),
        })
        const data = await response.json()
        console.log("Backend response data:", data)

        if (!response.ok) {
          console.error("Backend authentication failed:", data)
          return false
        }
        return true
      } catch (error) {
        console.error("Network or server error during backend sign-up:", error)
        return false 
      }
    },
  },
})
