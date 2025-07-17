"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-[#e36c89] hover:bg-[#e36c89]/10 hover:text-[#d15e7b] focus:bg-[#e36c89]/10 focus:text-[#d15e7b] dark:text-[#e87c97] dark:hover:bg-[#e87c97]/10 dark:hover:text-[#e87c97] dark:focus:bg-[#e87c97]/10 dark:focus:text-[#e87c97] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </button>
  )
} 