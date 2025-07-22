import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NavbarClient } from "./navbar-client"
import { getUserPointsSummary } from "@/lib/db/queries"

export async function Navbar() {
  const session = await getServerSession(authOptions)
  
  // Fetch user points on server side for faster rendering
  let userPoints = null
  if (session?.user?.id) {
    try {
      userPoints = await getUserPointsSummary(session.user.id)
    } catch (error) {
      // Silently fail - points are not critical for navbar
      console.error('Error fetching user points for navbar:', error)
    }
  }
  
  return <NavbarClient session={session} userPoints={userPoints} />
} 