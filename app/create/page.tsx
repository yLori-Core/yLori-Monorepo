import { Navbar } from "@/components/navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EventForm } from "@/components/event-form"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Camera, 
  ChevronDown, 
  Globe,
  Shuffle
} from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect to sign in if not authenticated
  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback className="text-xs">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Select defaultValue="personal">
              <SelectTrigger className="w-48 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal Calendar</SelectItem>
                <SelectItem value="team">Team Calendar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select defaultValue="public">
            <SelectTrigger className="w-32 border-border">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image Upload */}
          <div className="space-y-6">
            <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Abstract gradient design similar to Luma */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full blur-2xl"></div>
              </div>
              
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto border border-border">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Click to upload event image</p>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded border border-border"></div>
                  <span className="text-sm font-medium text-foreground">Theme</span>
                </div>
                <div className="text-muted-foreground hover:text-foreground">
                  <Shuffle className="w-4 h-4" />
                </div>
              </div>
              <div className="w-full justify-between border border-border rounded-md p-3">
                <span className="text-sm">Minimal</span>
                <ChevronDown className="w-4 h-4 float-right" />
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            <EventForm initialData={{ visibility: 'public' }} />
          </div>
        </div>
      </div>
    </div>
  )
} 