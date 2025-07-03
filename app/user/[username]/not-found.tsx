import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Users } from "lucide-react"
import Link from "next/link"

export default function UserNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-32">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-8 opacity-20">
            <Users className="w-full h-full text-muted-foreground" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">User Not Found</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            The user you're looking for doesn't exist or may have changed their username.
          </p>
          
          <Button asChild>
            <Link href="/">
              Go Back Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 