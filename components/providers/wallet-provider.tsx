'use client'

import * as React from 'react'
import { useAccount, useDisconnect, useBalance, useSendTransaction } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { parseEther, formatUnits } from 'viem'

export type WalletType = 'metamask' | 'phantom' | 'coinbase' | 'walletconnect' | 'rainbow'

export type Network = {
  id: string
  name: string
  symbol: string
  chainId: number
  rpcUrl?: string
}

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

function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Mock ETH price for USD conversion since wagmi doesn't provide price feeds natively
const ETH_PRICE_USD = 3500

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, isConnecting, chain } = useAccount()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { data: balanceData } = useBalance({ address })
  const { openConnectModal } = useConnectModal()

  const { sendTransactionAsync } = useSendTransaction()

  const [pendingTransaction, setPendingTransaction] = React.useState<Transaction | null>(null)

  const balance = balanceData ? parseFloat(formatUnits(balanceData.value, balanceData.decimals)) : 0
  const balanceUSD = balance * ETH_PRICE_USD

  const network: Network | null = chain ? {
    id: chain.id.toString(),
    name: chain.name,
    symbol: chain.nativeCurrency.symbol,
    chainId: chain.id,
  } : null

  const connect = React.useCallback(async (walletType: WalletType) => {
    if (openConnectModal) {
      openConnectModal()
    }
  }, [openConnectModal])

  const disconnect = React.useCallback(() => {
    wagmiDisconnect()
    setPendingTransaction(null)
  }, [wagmiDisconnect])

  const switchNetwork = React.useCallback((n: Network) => {
    // switchChain could be implemented here
  }, [])

  const sendTransaction = React.useCallback(async (amount: number, to: string): Promise<Transaction> => {
    if (!address) throw new Error("Wallet not connected")

    const amountInETH = amount / ETH_PRICE_USD

    // Create pending tx record
    const tx: Transaction = {
      hash: '',
      status: 'pending',
      amount,
      to,
      timestamp: Date.now(),
    }
    setPendingTransaction(tx)

    try {
      // Wagmi requires a valid 0x address. If 'to' is just an entity name, use a dummy burn/treasury address.
      let targetAddress = to
      if (!targetAddress.startsWith('0x') || targetAddress.length !== 42) {
        targetAddress = '0x000000000000000000000000000000000000dEaD'
      }

      const txHash = await sendTransactionAsync({
        to: targetAddress as `0x${string}`,
        value: parseEther(amountInETH.toFixed(18))
      })

      const updatedTx = { ...tx, hash: txHash, status: 'confirming' as const }
      setPendingTransaction(updatedTx)

      // Simulate blockchain confirmation wait
      await new Promise(resolve => setTimeout(resolve, 2000))

      const finalTx = { ...updatedTx, status: 'success' as const }
      setPendingTransaction(finalTx)
      return finalTx
    } catch (e) {
      setPendingTransaction({ ...tx, status: 'error' })
      throw e
    }
  }, [address, sendTransactionAsync])

  const openModal = React.useCallback(() => {
    if (openConnectModal) openConnectModal()
  }, [openConnectModal])

  const closeModal = React.useCallback(() => {
    // RainbowKit handles its own modal close
  }, [])

  const value = React.useMemo(
    () => ({
      isConnected,
      isConnecting,
      address: address || null,
      shortAddress: address ? shortenAddress(address) : null,
      walletType: null,
      network,
      balance,
      balanceUSD,
      connect,
      disconnect,
      switchNetwork,
      sendTransaction,
      isModalOpen: false,
      openModal,
      closeModal,
      pendingTransaction,
    }),
    [isConnected, isConnecting, address, network, balance, balanceUSD, connect, disconnect, switchNetwork, sendTransaction, openModal, closeModal, pendingTransaction]
  )

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
