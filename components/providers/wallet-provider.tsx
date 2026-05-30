'use client'

import * as React from 'react'

export type WalletType = 'metamask' | 'phantom' | 'coinbase' | 'walletconnect' | 'rainbow'

export type Network = {
  id: string
  name: string
  symbol: string
  chainId: number
  rpcUrl?: string
}

export const networks: Network[] = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', chainId: 1 },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', chainId: 137 },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH', chainId: 42161 },
  { id: 'optimism', name: 'Optimism', symbol: 'ETH', chainId: 10 },
  { id: 'base', name: 'Base', symbol: 'ETH', chainId: 8453 },
]

export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error'

export type Transaction = {
  hash: string
  status: TransactionStatus
  amount: number
  to: string
  timestamp: number
}

export type WalletState = {
  isConnected: boolean
  isConnecting: boolean
  address: string | null
  shortAddress: string | null
  walletType: WalletType | null
  network: Network | null
  balance: number
  balanceUSD: number
}

type WalletContextType = WalletState & {
  connect: (walletType: WalletType) => Promise<void>
  disconnect: () => void
  switchNetwork: (network: Network) => void
  sendTransaction: (amount: number, to: string) => Promise<Transaction>
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
  pendingTransaction: Transaction | null
}

const WalletContext = React.createContext<WalletContextType | null>(null)

export function useWallet() {
  const context = React.useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

function generateMockAddress(): string {
  const chars = '0123456789abcdef'
  let address = '0x'
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)]
  }
  return address
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function generateMockTxHash(): string {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

// Mock ETH price for USD conversion
const ETH_PRICE_USD = 3500

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    shortAddress: null,
    walletType: null,
    network: networks[0],
    balance: 0,
    balanceUSD: 0,
  })
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [pendingTransaction, setPendingTransaction] = React.useState<Transaction | null>(null)

  const connect = React.useCallback(async (walletType: WalletType) => {
    setState(prev => ({ ...prev, isConnecting: true }))
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const address = generateMockAddress()
    // Generate a random balance between 0.5 and 15 ETH
    const balance = Math.random() * 14.5 + 0.5
    
    setState({
      isConnected: true,
      isConnecting: false,
      address,
      shortAddress: shortenAddress(address),
      walletType,
      network: networks[0],
      balance,
      balanceUSD: balance * ETH_PRICE_USD,
    })
    
    setIsModalOpen(false)
  }, [])

  const disconnect = React.useCallback(() => {
    setState({
      isConnected: false,
      isConnecting: false,
      address: null,
      shortAddress: null,
      walletType: null,
      network: networks[0],
      balance: 0,
      balanceUSD: 0,
    })
    setPendingTransaction(null)
  }, [])

  const switchNetwork = React.useCallback((network: Network) => {
    setState(prev => ({
      ...prev,
      network,
    }))
  }, [])

  const sendTransaction = React.useCallback(async (amount: number, to: string): Promise<Transaction> => {
    const txHash = generateMockTxHash()
    
    // Create pending transaction
    const tx: Transaction = {
      hash: txHash,
      status: 'pending',
      amount,
      to,
      timestamp: Date.now(),
    }
    
    setPendingTransaction(tx)
    
    // Simulate wallet popup and user approval (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update to confirming
    tx.status = 'confirming'
    setPendingTransaction({ ...tx })
    
    // Simulate blockchain confirmation (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Complete transaction
    tx.status = 'success'
    setPendingTransaction({ ...tx })
    
    // Update balance
    const amountInETH = amount / ETH_PRICE_USD
    setState(prev => ({
      ...prev,
      balance: Math.max(0, prev.balance - amountInETH),
      balanceUSD: Math.max(0, prev.balanceUSD - amount),
    }))
    
    return tx
  }, [])

  const openModal = React.useCallback(() => setIsModalOpen(true), [])
  const closeModal = React.useCallback(() => setIsModalOpen(false), [])

  const value = React.useMemo(
    () => ({
      ...state,
      connect,
      disconnect,
      switchNetwork,
      sendTransaction,
      isModalOpen,
      openModal,
      closeModal,
      pendingTransaction,
    }),
    [state, connect, disconnect, switchNetwork, sendTransaction, isModalOpen, openModal, closeModal, pendingTransaction]
  )

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
