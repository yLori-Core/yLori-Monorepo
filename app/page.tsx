import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { ArrowRight, Calendar, MapPin, Sparkles, Zap, User, Twitter, Github, Linkedin } from "lucide-react"

export default function LandingPage() {
  // Web3 features for the showcase section
  const web3Features = [
    { 
      name: "Token Gating", 
      description: "Exclusive access for token holders",
      image: "/globe.svg", 
      color: "from-teal-500/40 to-cyan-500/40" 
    },
    { 
      name: "NFT Ticketing", 
      description: "Collectible proof of attendance",
      image: "/file.svg", 
      color: "from-emerald-500/40 to-teal-500/40" 
    },
    { 
      name: "On-chain RSVPs", 
      description: "Verifiable attendance records",
      image: "/window.svg", 
      color: "from-cyan-500/40 to-sky-500/40" 
    },
    { 
      name: "Multi-chain", 
      description: "Support across ecosystems",
      image: "/file.svg", 
      color: "from-sky-500/40 to-indigo-500/40" 
    },
  ];
  
  // Featured events data
  const featuredEvents = [
    {
      title: "ETHGlobal New York",
      date: "August 15 – 17, 2025",
      location: "New York, USA",
      image: "/ethglobal_newyork.png",
      attendees: 3500,
      link: "https://ethglobal.com/events/newyork"
    },
    {
      title: "ETHGlobal New Delhi",
      date: "September 26 – 28, 2025",
      location: "New Delhi, India",
      image: "/ethglobal_delhi.png",
      attendees: 1200,
      link: "https://ethglobal.com/events/newdelhi"
    },
    {
      title: "ETHGlobal Buenos Aires",
      date: "November 21 – 23, 2025",
      location: "Buenos Aires, Argentina",
      image: "/ethglobal_buenosaires.png",
      attendees: 2800,
      link: "https://ethglobal.com/events/buenosaires"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[100vh] flex items-center overflow-hidden py-3 sm:py-0">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(155,111,181,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(244,126,92,0.1),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">
            {/* Image section - First on mobile, second on desktop */}
            <div className="relative order-first lg:order-last max-w-[350px] sm:max-w-sm mx-auto lg:max-w-none -mt-16 sm:mt-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#9b6fb5] to-[#f47e5c] rounded-2xl blur-lg opacity-20 animate-pulse"></div>
              <div className="relative bg-black/5 dark:bg-white/5 border border-border rounded-2xl overflow-hidden shadow-xl max-h-[420px] sm:max-h-[500px]">
                <Link href="https://ethglobal.com/events/newdelhi" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/ethglobal_delhi.png"
                    alt="ETHGlobal Delhi Event"
                    width={450}
                    height={500}
                    className="w-full h-auto object-contain mx-auto"
                    priority
                  />
                </Link>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-5 -right-5 bg-gradient-to-br from-[#9b6fb5] to-[#e36c89] text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg shadow-lg transform rotate-6">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs font-bold">Delhi, India</span>
                </div>
              </div>
              <div className="absolute bottom-10 -left-6 sm:bottom-8 sm:-left-6 bg-background border border-border px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-lg flex items-center gap-2 transform -rotate-6">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#e36c89]" />
                <span className="text-xs font-medium">Sept, 25</span>
              </div>
            </div>
            
            {/* Text section - Second on mobile, first on desktop */}
            <div className="text-center lg:text-left order-last lg:order-first mt-1 lg:mt-0">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Plan Web3 events in <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#9b6fb5] via-[#e36c89] to-[#f47e5c]">seconds</span>
              </h1>
              <p className="mt-1.5 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto lg:mx-0">
                The easiest way to get your community on the same page with token-gated access and on-chain RSVPs
              </p>
              
              <div className="mt-3 sm:mt-6 flex justify-center lg:justify-start">
                <Button size="lg" className="bg-[#e36c89] hover:bg-[#d15e7b] text-white text-sm sm:text-base h-9 sm:h-11 px-4 sm:px-6 rounded-lg w-full sm:w-auto">
                  <Link href="/create" className="flex items-center justify-center gap-2 w-full">
                    Create event <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {/* Explore events button removed on mobile, shown on larger screens */}
                <Button size="lg" variant="outline" className="hidden sm:flex border-border hover:bg-accent/10 text-base h-11 px-6 rounded-lg sm:w-auto ml-4" asChild>
                  <Link href="/events">Explore events</Link>
                </Button>
              </div>
              
              {/* Web3 Features - Hidden on smallest screens, visible on larger ones */}
              <div className="mt-3 sm:mt-8 grid grid-cols-2 gap-2 sm:gap-3 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <div className="bg-[#9b6fb5]/10 p-1 sm:p-1.5 rounded-full">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#9b6fb5]" />
                  </div>
                  <span>Token-gated access</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <div className="bg-[#e36c89]/10 p-1 sm:p-1.5 rounded-full">
                    <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#e36c89]" />
                  </div>
                  <span>On-chain RSVPs</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <div className="bg-[#f47e5c]/10 p-1 sm:p-1.5 rounded-full">
                    <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#f47e5c]" />
                  </div>
                  <span>NFT ticketing</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <div className="bg-[#b85c9e]/10 p-1 sm:p-1.5 rounded-full">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#b85c9e]" />
                  </div>
                  <span>Multi-chain support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12">
            <div className="text-center sm:text-left mb-6 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Featured Events</h2>
              <p className="mt-2 text-base sm:text-lg text-muted-foreground">Discover the hottest Web3 gatherings</p>
            </div>
            <Button variant="outline" className="border-border hover:bg-accent/10 w-full sm:w-auto">
              <Link href="/events" className="flex items-center justify-center gap-2 w-full">
                Explore all events <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event, index) => (
              <Link 
                href={event.link} 
                target="_blank" 
                rel="noopener noreferrer"
                key={index} 
                className="group block"
              >
                <div className="relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-md">
                  {/* Event image */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
                      <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#e36c89]" />
                        <span className="text-xs font-medium">{event.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Event details */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[#9b6fb5] transition-colors">{event.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#e36c89]" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-[#f47e5c]" />
                        <span>{event.attendees.toLocaleString()} attendees</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Web3 Features Showcase Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
               Ready to host your next Web3 event?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of communities leveraging blockchain for unforgettable experiences
            </p>
          </div>
          
          {/* Animated Feature Cards */}
          <div className="relative py-10">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {web3Features.map((feature, index) => {
                  // Create a color array from the logo colors
                  const colors = [
                    "from-[#9b6fb5]/40 to-[#b85c9e]/40", 
                    "from-[#e36c89]/40 to-[#dc8674]/40", 
                    "from-[#f47e5c]/40 to-[#f58e6c]/40",
                    "from-[#b85c9e]/40 to-[#9b6fb5]/40"
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                  <div 
                    key={index} 
                    className="group relative block aspect-[3/4] rounded-xl overflow-hidden will-change-transform"
                    style={{ 
                      animation: `float 8s ease-in-out ${index * 1}s infinite`,
                      animationFillMode: 'both'
                    }}
                  >
                    {/* Animated glow effect */}
                    <div 
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300 ease-out`}
                      style={{ 
                        animation: `pulse 4s ease-in-out ${index * 0.5}s infinite alternate`,
                        transformOrigin: 'center',
                        willChange: 'opacity, transform'
                      }}
                    ></div>
                    
                    {/* Card background */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-br ${color} transition-transform duration-300 ease-out group-hover:scale-[1.03] will-change-transform`}
                    ></div>
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Animated particles - limited to 3 for performance */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={i}
                          className="absolute w-1 h-1 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            top: `${20 + (i * 30)}%`,
                            left: `${20 + (i * 30)}%`,
                            animation: `particle 3s ease-out ${i * 0.5}s infinite`,
                            willChange: 'transform, opacity'
                          }}
                        ></div>
                      ))}
                    </div>
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col p-3 sm:p-5 justify-between z-10">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transform transition-transform duration-300 ease-out group-hover:scale-110 group-hover:shadow-lg will-change-transform">
                        <Image 
                          src={feature.image} 
                          alt={feature.name} 
                          width={28} 
                          height={28}
                          className="w-5 h-5 sm:w-7 sm:h-7 opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      
                      <div>
                        <h3 className="text-base sm:text-xl font-bold text-white mb-1 transform transition-all duration-300 ease-out group-hover:translate-y-[-2px] will-change-transform">
                          {feature.name}
                        </h3>
                        
                        {/* Animated underline */}
                        <div className="w-8 sm:w-12 h-0.5 bg-white/70 rounded transition-all duration-300 ease-out group-hover:w-full will-change-transform"></div>
                        
                        {/* Text that fades in on hover */}
                        <p className="mt-2 text-xs sm:text-sm text-white/0 group-hover:text-white/90 transition-all duration-300 ease-out">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#9b6fb5] to-[#f47e5c] rounded-lg blur-sm opacity-25 group-hover:opacity-50 transition-all duration-300 ease-out"></div>
              <Button 
                size="lg" 
                className="relative bg-[#e36c89] hover:bg-[#d15e7b] text-white text-base h-12 px-6 sm:px-8 rounded-lg shadow-md transition-all duration-300 ease-out will-change-transform group-hover:shadow-[#e36c89]/20 group-hover:translate-y-[-1px] w-full sm:w-auto"
              >
                <Link href="/create" className="flex items-center justify-center gap-2 w-full">
                  Create your event <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Trusted by Web3 Communities</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              See why leading organizations and DAOs choose yLori for their event management needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Testimonial 1 */}
            <div className="bg-card p-5 sm:p-6 rounded-xl border relative">
              <div className="absolute -top-3 -left-3 w-8 sm:w-10 h-8 sm:h-10 bg-[#9b6fb5] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl sm:text-2xl font-serif">"</span>
              </div>
              <p className="mb-6 pt-4 text-sm sm:text-base">
                yLori has completely transformed how we manage our community events. The token gating feature ensures only our members can attend, and the on-chain RSVPs provide perfect accountability.
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                  <span className="text-[#9b6fb5] font-bold text-lg sm:text-xl">E</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base">Elena Rodriguez</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Community Lead, EthereumDAO</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-card p-5 sm:p-6 rounded-xl border relative">
              <div className="absolute -top-3 -left-3 w-8 sm:w-10 h-8 sm:h-10 bg-[#e36c89] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl sm:text-2xl font-serif">"</span>
              </div>
              <p className="mb-6 pt-4 text-sm sm:text-base">
                Since switching to yLori, our event attendance has increased by 40%. The NFT ticketing system adds a collectible element that our community loves, and the platform is incredibly easy to use.
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                  <span className="text-[#e36c89] font-bold text-lg sm:text-xl">M</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base">Michael Chen</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Founder, NFT Creators Guild</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-card p-5 sm:p-6 rounded-xl border relative">
              <div className="absolute -top-3 -left-3 w-8 sm:w-10 h-8 sm:h-10 bg-[#f47e5c] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl sm:text-2xl font-serif">"</span>
              </div>
              <p className="mb-6 pt-4 text-sm sm:text-base">
                We've hosted over 50 events on yLori in the past year. The multi-chain support allows us to engage with communities across different ecosystems seamlessly. It's become our go-to platform.
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                  <span className="text-[#f47e5c] font-bold text-lg sm:text-xl">S</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base">Sarah Johnson</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Events Director, Crypto Collective</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 sm:mt-16 text-center">
            <Button 
              className="bg-[#e36c89] hover:bg-[#d15e7b] text-white font-medium px-6 sm:px-8 py-4 sm:py-6 h-auto text-sm sm:text-base rounded-lg shadow-lg w-full sm:w-auto"
            >
              <Link href="/create" className="flex items-center justify-center gap-2 w-full">
                Start planning your event <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {/* Logo and description */}
            <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image 
                  src="/logo_full.png" 
                  alt="yLori Logo" 
                  width={120} 
                  height={40} 
                  className="h-8 sm:h-10 w-auto object-contain"
                />
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground">
                The easiest way to plan and manage Web3 events with token-gated access and on-chain RSVPs.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#9b6fb5] transition-colors">
                  <Twitter className="h-4 sm:h-5 w-4 sm:w-5" />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#e36c89] transition-colors">
                  <Github className="h-4 sm:h-5 w-4 sm:w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#f47e5c] transition-colors">
                  <Linkedin className="h-4 sm:h-5 w-4 sm:w-5" />
                </a>
              </div>
            </div>

            {/* Product links */}
            <div>
              <h3 className="font-medium text-sm sm:text-base mb-3 sm:mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/events" className="text-xs sm:text-sm text-muted-foreground hover:text-[#e36c89] transition-colors">
                    Explore Events
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="text-xs sm:text-sm text-muted-foreground hover:text-[#e36c89] transition-colors">
                    Create Event
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-[#e36c89] transition-colors">
                    Token Gating
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-[#e36c89] transition-colors">
                    NFT Ticketing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h3 className="font-medium text-sm sm:text-base mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-[#9b6fb5] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-[#9b6fb5] transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-[#9b6fb5] transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-[#9b6fb5] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="font-medium text-sm sm:text-base mb-3 sm:mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-[#f47e5c] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-[#f47e5c] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-[#f47e5c] transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="h-px bg-border my-6 sm:my-8"></div>

          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-0">
              © {new Date().getFullYear()} yLori. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-xs text-muted-foreground hover:text-[#e36c89] transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-[#9b6fb5] transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-[#f47e5c] transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
