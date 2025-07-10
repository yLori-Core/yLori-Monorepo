"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"
import { AuthModal } from "./auth-modal"

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-[#9b6fb5]/20 animate-pulse" />
    )
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative w-8 h-8 rounded-full">
            <Avatar className="w-8 h-8 ring-2 ring-[#9b6fb5]/20">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
              <AvatarFallback className="bg-[#9b6fb5]/20 text-[#9b6fb5]">
                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="hover:bg-[#9b6fb5]/10 focus:bg-[#9b6fb5]/10 hover:text-[#9b6fb5] focus:text-[#9b6fb5]">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()} className="hover:bg-[#e36c89]/10 focus:bg-[#e36c89]/10 hover:text-[#e36c89] focus:text-[#e36c89]">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <AuthModal>
      <Button className="bg-[#9b6fb5] hover:bg-[#8a5ea4] text-white font-medium px-4 py-2 h-9 text-sm shadow-sm">
        Sign in
      </Button>
    </AuthModal>
  )
} 