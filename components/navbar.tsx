import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NavbarClient } from "./navbar-client"

export async function Navbar() {
  const session = await getServerSession(authOptions)
  
  return <NavbarClient session={session} />
} 