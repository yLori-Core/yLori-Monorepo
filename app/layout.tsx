import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner"


const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ['system-ui', 'arial'],
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: "yLori - Delightful Web3 Events",
  description: "Discover amazing Web3 events, connect with builders, and join the community",
  twitter: {
    card: 'summary_large_image',
    title: 'yLori - Delightful Web3 Events',
    description: 'Discover amazing Web3 events, connect with builders, and join the community',
    site: '@ylori_',
    creator: '@ylori_'
  },
  openGraph: {
    type: 'website',
    title: 'yLori - Delightful Web3 Events',
    description: 'Discover amazing Web3 events, connect with builders, and join the community',
    siteName: 'yLori'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Toaster />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
