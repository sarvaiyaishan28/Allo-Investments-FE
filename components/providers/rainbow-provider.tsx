'use client'

import * as React from 'react'
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
  lightTheme
} from '@rainbow-me/rainbowkit'
import {
  sepolia,
  arbitrumSepolia,
  bscTestnet,
} from 'wagmi/chains'
import {
  metaMaskWallet,
  okxWallet,
  binanceWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { useTheme } from 'next-themes'

// Read project ID from env
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// Build wallets list dynamically.
const recommendedWallets = [metaMaskWallet, okxWallet, binanceWallet]
if (projectId) {
  recommendedWallets.push(walletConnectWallet)
}

const config = getDefaultConfig({
  appName: 'Allo Investments',
  projectId: projectId || '85a6aab6ad44980b85b0083ab847278e', // Fallback needed for wagmi
  chains: [sepolia, arbitrumSepolia, bscTestnet],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: recommendedWallets,
    },
  ],
  ssr: true,
})

const queryClient = new QueryClient()

export function RainbowProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  // Provide consistent styling between dark and light modes
  const theme = resolvedTheme === 'dark'
    ? darkTheme({
      accentColor: '#ea580c', // match primary orange
      accentColorForeground: 'white',
      borderRadius: 'large',
    })
    : lightTheme({
      accentColor: '#ea580c', // match primary orange
      accentColorForeground: 'white',
      borderRadius: 'large',
    })

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
