"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300 dark:focus:bg-red-950/20 dark:focus:text-red-300 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </button>
  )
} 