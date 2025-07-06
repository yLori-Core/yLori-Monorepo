import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { ArrowRight, Calendar, Clock, Globe, MapPin, Sparkles, Zap } from "lucide-react"

export default function LandingPage() {
  // Press quotes for the scrolling section
  const pressQuotes = [
    { source: "CoinDesk", quote: "The future of Web3 event planning" },
    { source: "Decrypt", quote: "Solves the on-chain RSVP problem" },
    { source: "The Block", quote: "This is where my crypto calendar exists" },
    { source: "Ethereum Weekly", quote: "yLori is a mainstay of my Web3 life" },
    { source: "CryptoSlate", quote: "The perfect hub for DAOs and communities" },
    { source: "Web3 Daily", quote: "Essential tool for token-gated events" },
  ];

  // Event templates for the showcase section
  const eventTemplates = [
    { 
      name: "DAO Governance", 
      image: "/globe.svg", 
      color: "from-teal-500/20 to-cyan-500/20" 
    },
    { 
      name: "NFT Minting Party", 
      image: "/file.svg", 
      color: "from-emerald-500/20 to-teal-500/20" 
    },
    { 
      name: "Token Launch", 
      image: "/window.svg", 
      color: "from-cyan-500/20 to-sky-500/20" 
    },
    { 
      name: "Hackathon", 
      image: "/file.svg", 
      color: "from-sky-500/20 to-indigo-500/20" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.1),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Plan Web3 events in <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-400">seconds</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground">
                The easiest way to get your community on the same page with token-gated access and on-chain RSVPs
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 text-base h-12 px-6 rounded-lg">
                  <Link href="/create" className="flex items-center gap-2">
                    Create event <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-border hover:bg-accent text-base h-12 px-6 rounded-lg">
                  Explore events
                </Button>
              </div>
              
              {/* Web3 Features */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-teal-500/10 p-2 rounded-full">
                    <Sparkles className="h-4 w-4 text-teal-500" />
                  </div>
                  <span>Token-gated access</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-cyan-500/10 p-2 rounded-full">
                    <MapPin className="h-4 w-4 text-cyan-500" />
                  </div>
                  <span>On-chain RSVPs</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-emerald-500/10 p-2 rounded-full">
                    <Zap className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span>NFT ticketing</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-sky-500/10 p-2 rounded-full">
                    <Calendar className="h-4 w-4 text-sky-500" />
                  </div>
                  <span>Multi-chain support</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-400 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-black/5 dark:bg-white/5 border border-border rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="/vercel.svg"
                  alt="Event page mockup"
                  width={600}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-teal-500 to-cyan-400 text-white px-4 py-2 rounded-lg shadow-lg transform rotate-6">
                <span className="text-sm font-bold">100+ attendees</span>
              </div>
              <div className="absolute bottom-12 -left-8 bg-background border border-border px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transform -rotate-6">
                <Calendar className="h-5 w-5 text-teal-500" />
                <span className="text-sm font-medium">Starts in 2 days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Press Quotes - Infinite Scroll */}
      <section className="py-12 bg-accent/30 border-y border-border overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...pressQuotes, ...pressQuotes].map((quote, index) => (
            <div key={index} className="mx-8 flex items-center">
              <span className="text-xl md:text-2xl font-bold text-foreground/80">"{quote.quote}"</span>
              <span className="mx-2">—</span>
              <span className="text-lg md:text-xl font-medium text-muted-foreground">{quote.source}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Event Templates Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              For every Web3 occasion, <br/>
              every <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-400">vibe</span> 🎉
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No more boring invitations or complicated token gates
            </p>
          </div>
          
          {/* Rotating Event Templates */}
          <div className="relative h-[500px] perspective">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 transform-style-3d animate-float">
                {eventTemplates.map((template, index) => (
                  <div 
                    key={index} 
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden border border-border shadow-xl bg-gradient-to-br ${template.color} p-6 transform transition-transform hover:scale-105`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="relative h-full flex flex-col justify-between">
                      <div className="w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Image src={template.image} alt={template.name} width={24} height={24} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{template.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 text-base h-12 px-6 rounded-lg">
              <Link href="/create" className="flex items-center gap-2">
                Create event <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-accent/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="bg-teal-500/10 p-3 rounded-xl w-fit">
                <Sparkles className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold">Token-gated events</h3>
              <p className="text-muted-foreground">Limit access to your events based on token ownership, NFTs, or DAO membership.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-cyan-500/10 p-3 rounded-xl w-fit">
                <Globe className="h-6 w-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold">On-chain RSVPs</h3>
              <p className="text-muted-foreground">Attendees can RSVP with their wallet, creating a verifiable record on the blockchain.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-sky-500/10 p-3 rounded-xl w-fit">
                <MapPin className="h-6 w-6 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold">Virtual & IRL events</h3>
              <p className="text-muted-foreground">Host events online with video integration or in-person with location verification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Ready to host your next Web3 event?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of DAOs, communities, and protocols using yLori to connect with their members.
          </p>
          <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 text-base h-12 px-8 rounded-lg">
            <Link href="/create">Get started</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
