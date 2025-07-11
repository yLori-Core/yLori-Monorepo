import { Navbar } from "@/components/navbar"
import { CreateEventForm } from "@/components/create-event-form"
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Event</h1>
          <p className="text-muted-foreground mt-2">
            Share your event with the community and manage registrations
          </p>
        </div>

        {/* Main Content */}
        <CreateEventForm />
      </div>
    </div>
  )
} 