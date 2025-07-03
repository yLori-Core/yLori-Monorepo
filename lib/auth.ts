import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { getOrCreateUser, getUserByEmail } from "@/lib/db/queries"

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
    async signIn({ user }) {
      console.log('🔐 Auth signIn callback - creating/finding user for:', user);
      try {
        // Ensure user exists in our database when they sign in
        if (user.email) {
          console.log('🔐 Auth signIn callback - creating/finding user for:', user.email);
          await getOrCreateUser(user.email, user.name, user.image);
          console.log('✅ User successfully created/found in database');
        }
        return true;
      } catch (error) {
        console.error('❌ Error in signIn callback:', error);
        // Return false to prevent sign in if database operation fails
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user && session.user.email) {
        try {
          // Fetch the latest user data from our database
          const dbUser = await getUserByEmail(session.user.email);
          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.name = dbUser.name;
            session.user.image = dbUser.image;
            // Add username to session if we need it
            (session.user as any).username = dbUser.username;
          }
        } catch (error) {
          console.error('Error fetching user in session callback:', error);
          // Fallback to token data
          session.user.id = token.sub as string;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
} 