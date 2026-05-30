'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Shield,
  Building2,
  AlertTriangle,
  Download,
  Info,
  Wallet,
  Loader2,
  ExternalLink,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWallet } from '@/components/providers/wallet-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { createInvestment, updateDeal } from '@/lib/api-client'
import type { Deal, DealStatus } from '@/lib/types'



const ETH_PRICE_USD = 3500

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusBadge(status: DealStatus) {
  const config: Record<DealStatus, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    submitted: { label: 'Submitted', className: 'bg-warning/10 text-warning border-warning/20' },
    onboarding: { label: 'Open', className: 'bg-success/10 text-success border-success/20' },
    closing: { label: 'Closing Soon', className: 'bg-warning/10 text-warning border-warning/20' },
    close_requested: { label: 'Close Requested', className: 'bg-muted text-muted-foreground' },
    closed: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
    test: { label: 'Test', className: 'bg-primary/10 text-primary border-primary/20' },
    migration: { label: 'Migration', className: 'bg-muted text-muted-foreground' },
  }
  const c = config[status]
  return <Badge variant="outline" className={cn('text-[10px] font-medium', c.className)}>{c.label}</Badge>
}

type InvestStep = 'amount' | 'processing' | 'success' | 'error'

function InvestDialog({ deal, open, onOpenChange }: { deal: Deal; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { requireAuth } = useAuth()
  const { 
    isConnected, 
    openModal, 
    balance, 
    balanceUSD, 
    network, 
    shortAddress, 
    sendTransaction,
    pendingTransaction,
  } = useWallet()
  
  // Check auth when dialog opens
  React.useEffect(() => {
    if (open) {
      const isAuthed = requireAuth()
      if (!isAuthed) {
        onOpenChange(false)
      }
    }
  }, [open, requireAuth, onOpenChange])
  
  const [amount, setAmount] = React.useState(deal.minimumInvestment.toString())
  const [selectedIdentity, setSelectedIdentity] = React.useState<string>('')
  const [step, setStep] = React.useState<InvestStep>('amount')
  const [txHash, setTxHash] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [identities, setIdentities] = React.useState<any[]>([])

  React.useEffect(() => {
    import('@/lib/api-client').then(({ fetchIdentities }) => {
      fetchIdentities().then(setIdentities).catch(console.error)
    })
  }, [])

  React.useEffect(() => {
    if (open) {
      setStep('amount')
      setAmount(deal.minimumInvestment.toString())
      setSelectedIdentity('')
      setTxHash(null)
      setError(null)
    }
  }, [open, deal.minimumInvestment])

  const parsedAmount = parseFloat(amount) || 0
  const amountInETH = parsedAmount / ETH_PRICE_USD
  const isValidAmount = parsedAmount >= deal.minimumInvestment
  const isIdentitySelected = selectedIdentity !== ''
  const selectedIdentityData = identities.find(i => i.id === selectedIdentity)
  const hasInsufficientBalance = isConnected && balanceUSD < parsedAmount
  const estimatedGas = 0.002
  const estimatedGasUSD = estimatedGas * ETH_PRICE_USD

  const handleInvest = async () => {
    if (!isConnected) {
      openModal()
      return
    }

    if (hasInsufficientBalance || !isValidAmount || !isIdentitySelected) return

    setStep('processing')
    setError(null)

    try {
      const tx = await sendTransaction(parsedAmount, deal.entityName)
      
      // Update backend
      await createInvestment({
        id: crypto.randomUUID(),
        dealId: deal.id,
        dealName: deal.name,
        investorId: selectedIdentity,
        investorName: selectedIdentityData?.firstName ? `${selectedIdentityData.firstName} ${selectedIdentityData.lastName}` : selectedIdentityData?.name || 'Unknown',
        investorEmail: selectedIdentityData?.email || '',
        investorType: selectedIdentityData?.type || 'individual',
        kycStatus: selectedIdentityData?.kycStatus || 'pending',
        subscriptionAmount: parsedAmount,
        capitalWired: parsedAmount,
        managementFee: deal.managementFee || 0,
        carry: deal.carry || 0,
        status: 'wired',
        txHash: tx.hash,
        chain: network?.id || 'ethereum',
        signedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })

      // Also update the deal
      await updateDeal(deal.id, {
        totalWired: deal.totalWired + parsedAmount,
        totalSigned: deal.totalSigned + parsedAmount,
      })

      setTxHash(tx.hash)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
      setStep('error')
    }
  }

  const copyTxHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const truncatedHash = txHash ? `${txHash.slice(0, 10)}...${txHash.slice(-8)}` : ''

  // Processing Step
  if (step === 'processing') {
    const statusText = pendingTransaction?.status === 'confirming' 
      ? 'Confirming on blockchain...' 
      : 'Approve in your wallet'
    
    return (
      <DialogContent className="sm:max-w-sm">
        <div className="py-8 text-center space-y-5">
          <div className="relative mx-auto size-16">
            <div className="absolute inset-0 rounded-full border-2 border-muted" />
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-primary/5 flex items-center justify-center">
              <Wallet className="size-5 text-primary" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Processing</h3>
            <p className="text-sm text-muted-foreground">{statusText}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{formatCurrency(parsedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network</span>
              <span className="font-medium">{network?.name}</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Do not close this window
          </p>
        </div>
      </DialogContent>
    )
  }

  // Success Step
  if (step === 'success') {
    return (
      <DialogContent className="sm:max-w-sm">
        <div className="py-6 text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="size-14 rounded-full bg-success/10 flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="size-7 text-success" />
          </motion.div>
          <div>
            <h3 className="font-semibold mb-1">Investment Successful</h3>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(parsedAmount)} invested in {deal.name}
            </p>
          </div>
          
          {txHash && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide">Transaction</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-xs font-mono">{truncatedHash}</code>
                <Button variant="ghost" size="icon" className="size-6" onClick={copyTxHash}>
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                </Button>
                <Button variant="ghost" size="icon" className="size-6" asChild>
                  <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button size="sm" className="flex-1 h-9" asChild>
              <Link href="/investments">View Portfolio</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    )
  }

  // Error Step
  if (step === 'error') {
    return (
      <DialogContent className="sm:max-w-sm">
        <div className="py-6 text-center space-y-4">
          <div className="size-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="size-7 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Transaction Failed</h3>
            <p className="text-xs text-muted-foreground">
              {error || 'Something went wrong. Please try again.'}
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" className="flex-1 h-9" onClick={() => setStep('amount')}>
              Try Again
            </Button>
          </div>
        </div>
      </DialogContent>
    )
  }

  // Amount Step (default)
  return (
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle className="text-base">Invest in {deal.name}</DialogTitle>
        <DialogDescription className="text-xs">
          Enter your investment amount
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Identity Selection */}
        <div className="space-y-1.5">
          <Label htmlFor="identity" className="text-xs">Investing As</Label>
          <Select value={selectedIdentity} onValueChange={setSelectedIdentity}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select identity" />
            </SelectTrigger>
            <SelectContent>
              {identities.map((identity) => (
                <SelectItem key={identity.id} value={identity.id}>
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                      {identity.firstName?.charAt(0) || identity.name?.charAt(0) || 'U'}{identity.lastName?.charAt(0) || ''}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm">{identity.firstName ? `${identity.firstName} ${identity.lastName}` : identity.name}</span>
                      <span className="text-[10px] text-muted-foreground">{identity.type}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedIdentityData && (
            <p className="text-[10px] text-muted-foreground">
              {selectedIdentityData.email} • KYC {selectedIdentityData.kycStatus}
            </p>
          )}
        </div>

        {/* Wallet Status */}
        {isConnected ? (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border text-sm">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-success" />
              <span className="font-mono text-xs">{shortAddress}</span>
            </div>
            <div className="text-right">
              <span className="font-medium text-xs">{formatCurrency(balanceUSD)}</span>
              <span className="text-muted-foreground text-[10px] ml-1">({balance.toFixed(2)} ETH)</span>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full h-10" onClick={openModal}>
            <Wallet className="size-4 mr-2" />
            Connect Wallet
          </Button>
        )}

        {/* Amount Input */}
        <div className="space-y-1.5">
          <Label htmlFor="amount" className="text-xs">Amount (USD)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-7 h-10 text-base font-medium"
              min={deal.minimumInvestment}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Min: {formatCurrency(deal.minimumInvestment)}</span>
            <span>{amountInETH.toFixed(4)} ETH</span>
          </div>
        </div>

        {/* Validation */}
        <AnimatePresence>
          {!isValidAmount && parsedAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="size-3.5" />
                <AlertDescription className="text-xs ml-2">
                  Minimum {formatCurrency(deal.minimumInvestment)} required
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          {hasInsufficientBalance && isValidAmount && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="size-3.5" />
                <AlertDescription className="text-xs ml-2">
                  Insufficient balance
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        <div className="space-y-1.5 text-xs pt-2 border-t">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mgmt Fee</span>
            <span>{deal.managementFee}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Carry</span>
            <span>{deal.carry}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Est. Gas</span>
            <span>~{formatCurrency(estimatedGasUSD)}</span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button 
          className="w-full h-10" 
          disabled={!isValidAmount || hasInsufficientBalance || !isIdentitySelected}
          onClick={handleInvest}
        >
          {!isConnected ? (
            <>
              <Wallet className="size-4 mr-2" />
              Connect Wallet
            </>
          ) : (
            <>
              Invest {formatCurrency(parsedAmount)}
              <ArrowRight className="size-4 ml-2" />
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

interface DealInvestPageProps {
  deal: Deal
}

export function DealInvestPage({ deal }: DealInvestPageProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const progress = Math.min((deal.totalWired / deal.targetRaise) * 100, 100)
  const daysUntilClose = Math.max(0, Math.ceil((new Date(deal.estimatedClosingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  const isClosingSoon = daysUntilClose <= 7 && daysUntilClose > 0
  const isClosed = deal.status === 'closed'

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <Link 
        href="/deals" 
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-start justify-between gap-4"
      >
        <div className="flex items-start gap-3">
          <Avatar className="size-12 rounded-lg bg-primary text-primary-foreground shrink-0">
            <AvatarFallback className="text-lg font-semibold rounded-lg bg-transparent">
              {deal.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge(deal.status)}
              {isClosingSoon && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px]">
                  <Clock className="size-3 mr-1" />
                  {daysUntilClose}d left
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-semibold">{deal.name}</h1>
            <p className="text-sm text-muted-foreground">{deal.entityName}</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-11" disabled={isClosed}>
              <Wallet className="size-4 mr-2" />
              Invest Now
            </Button>
          </DialogTrigger>
          <InvestDialog deal={deal} open={dialogOpen} onOpenChange={setDialogOpen} />
        </Dialog>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Funding Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Funding Progress</span>
                <span className="text-sm font-semibold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 mb-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(deal.totalWired)} raised</span>
                <span>{formatCurrency(deal.targetRaise)} target</span>
              </div>
            </CardContent>
          </Card>

          {/* Deal Memo */}
          <Card>
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-medium">Deal Memo</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">{deal.memo || 'No memo available'}</p>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card>
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Users className="size-4 mx-auto mb-1.5 text-muted-foreground" />
                  <p className="text-lg font-semibold">{deal.investorCount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Investors</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <DollarSign className="size-4 mx-auto mb-1.5 text-muted-foreground" />
                  <p className="text-lg font-semibold">{formatCurrency(deal.totalSigned)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Committed</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <TrendingUp className="size-4 mx-auto mb-1.5 text-muted-foreground" />
                  <p className="text-lg font-semibold">{deal.managementFee}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Mgmt Fee</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Shield className="size-4 mx-auto mb-1.5 text-muted-foreground" />
                  <p className="text-lg font-semibold">{deal.carry}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Carry</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {deal.pitchDeckUrl ? (
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href={deal.pitchDeckUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="size-4 mr-2" />
                    Deal Pitch Deck
                    <Download className="size-3 ml-auto" />
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">No documents available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-medium">Deal Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target Raise</span>
                <span className="font-medium">{formatCurrency(deal.targetRaise)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Minimum</span>
                <span className="font-medium">{formatCurrency(deal.minimumInvestment)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Offering Type</span>
                <span className="font-medium uppercase">{deal.offeringType}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Closing</span>
                <span className="font-medium">{formatDate(deal.estimatedClosingDate)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Signed</span>
                <span className="font-medium">{formatCurrency(deal.totalSigned)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Risk Disclaimer */}
          <Alert className="border-warning/20 bg-warning/5">
            <AlertTriangle className="size-4 text-warning" />
            <AlertDescription className="text-xs text-muted-foreground ml-2">
              Private investments are illiquid and involve a high degree of risk. Past performance is not indicative of future results.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
