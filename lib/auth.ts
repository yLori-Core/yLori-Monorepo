import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      console.log("=== SESSION CALLBACK ===")
      console.log("Session data:", JSON.stringify(session, null, 2))
      console.log("Token data:", JSON.stringify(token, null, 2))
      console.log("User image URL:", session.user?.image)
      
      if (session.user) {
        session.user.id = token.sub as string
      }
      
      console.log("Final session:", JSON.stringify(session, null, 2))
      return session
    },
    async jwt({ token, user, account, profile }) {
      console.log("=== JWT CALLBACK ===")
      console.log("Token:", JSON.stringify(token, null, 2))
      console.log("User:", JSON.stringify(user, null, 2))
      console.log("Account:", JSON.stringify(account, null, 2))
      console.log("Profile:", JSON.stringify(profile, null, 2))
      
      if (user) {
        token.sub = user.id
        console.log("User ID set to token:", user.id)
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
} 