"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, Copy, ExternalLink, LogOut } from "lucide-react"

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const connectWallet = async (walletType: string) => {
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true)
      setWalletAddress("0x1234...5678")
    }, 1000)
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
  }

  const copyAddress = () => {
    navigator.clipboard.writeText("0x1234567890abcdef1234567890abcdef12345678")
  }

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-xl border-purple-200 hover:border-purple-300">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            {walletAddress}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => connectWallet("metamask")}>
          <div className="w-6 h-6 bg-orange-500 rounded mr-2"></div>
          MetaMask
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => connectWallet("walletconnect")}>
          <div className="w-6 h-6 bg-blue-500 rounded mr-2"></div>
          WalletConnect
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => connectWallet("coinbase")}>
          <div className="w-6 h-6 bg-blue-600 rounded mr-2"></div>
          Coinbase Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
