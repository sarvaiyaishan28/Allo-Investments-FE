import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { RainbowProvider } from '@/components/providers/rainbow-provider'
import { WalletProvider } from '@/components/providers/wallet-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { LoginRequiredDialog } from '@/components/ui/login-required-dialog'
import { Toaster } from '@/components/ui/sonner'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Allo - Blockchain Investment Platform',
  description: 'Discover and invest in private market opportunities on the blockchain. Access curated deals, manage your portfolio, and track investments in real-time.',
  generator: 'v0.app',
  keywords: ['blockchain', 'investment', 'private markets', 'SPV', 'fund management', 'crypto'],
  authors: [{ name: 'Allo' }],
  icons: {
    icon: '/allo-icon.png',
    apple: '/allo-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} font-sans antialiased bg-background`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RainbowProvider>
              <WalletProvider>
                {children}
                <LoginRequiredDialog />
                <Toaster />
              </WalletProvider>
            </RainbowProvider>
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
