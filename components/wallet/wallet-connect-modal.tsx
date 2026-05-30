'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, X, Loader2, Check, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useWallet, type WalletType, networks } from '@/components/providers/wallet-provider'

const wallets: { id: WalletType; name: string; icon: string; description: string }[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect using MetaMask browser extension',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'Connect using Phantom wallet',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Connect using Coinbase Wallet',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Scan with WalletConnect compatible wallet',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    description: 'Connect using Rainbow wallet',
  },
]

interface WalletConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletConnectModal({ open, onOpenChange }: WalletConnectModalProps) {
  const { connect, isConnecting, isConnected, shortAddress, network, switchNetwork, disconnect } = useWallet()
  const [selectedWallet, setSelectedWallet] = React.useState<WalletType | null>(null)
  const [step, setStep] = React.useState<'select' | 'connecting' | 'connected'>('select')

  React.useEffect(() => {
    if (open) {
      setStep(isConnected ? 'connected' : 'select')
      setSelectedWallet(null)
    }
  }, [open, isConnected])

  const handleConnect = async (walletType: WalletType) => {
    setSelectedWallet(walletType)
    setStep('connecting')
    await connect(walletType)
    setStep('connected')
  }

  const handleDisconnect = () => {
    disconnect()
    setStep('select')
    setSelectedWallet(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            {step === 'select' && 'Connect Wallet'}
            {step === 'connecting' && 'Connecting...'}
            {step === 'connected' && 'Wallet Connected'}
          </DialogTitle>
          <DialogDescription>
            {step === 'select' && 'Choose your preferred wallet to connect'}
            {step === 'connecting' && `Connecting to ${wallets.find(w => w.id === selectedWallet)?.name}...`}
            {step === 'connected' && 'Your wallet is connected and ready to use'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-2"
            >
              {wallets.map((wallet) => (
                <motion.button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border border-border p-4 transition-all',
                    'hover:border-primary/50 hover:bg-accent/50',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  )}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="text-3xl">{wallet.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{wallet.name}</p>
                    <p className="text-sm text-muted-foreground">{wallet.description}</p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </motion.button>
              ))}
            </motion.div>
          )}

          {step === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                className="relative flex size-20 items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                <span className="text-4xl">
                  {wallets.find(w => w.id === selectedWallet)?.icon}
                </span>
              </motion.div>
              <p className="mt-6 text-center text-muted-foreground">
                Please approve the connection request in your wallet
              </p>
            </motion.div>
          )}

          {step === 'connected' && (
            <motion.div
              key="connected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center justify-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success"
                >
                  <Check className="size-8" />
                </motion.div>
                <p className="mt-4 font-mono text-sm text-muted-foreground">
                  {shortAddress}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Network</p>
                <div className="flex flex-wrap gap-2">
                  {networks.map((n) => (
                    <Button
                      key={n.id}
                      variant={network?.id === n.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => switchNetwork(n)}
                      className="gap-1"
                    >
                      {n.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
