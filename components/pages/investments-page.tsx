'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  Search,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  PieChart,
  ArrowUpRight,
  Eye,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { fetchInvestments, fetchDeals } from '@/lib/api-client'
import type { InvestmentStatus, Investment, Deal } from '@/lib/types'

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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusConfig(status: InvestmentStatus) {
  const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    invited: { label: 'Invited', className: 'bg-muted text-muted-foreground', icon: Clock },
    viewed: { label: 'Viewed', className: 'bg-accent/20 text-accent-foreground', icon: Clock },
    committed: { label: 'Committed', className: 'bg-primary/10 text-primary', icon: CheckCircle2 },
    signed: { label: 'Signed', className: 'bg-primary/10 text-primary', icon: CheckCircle2 },
    wired: { label: 'Wired', className: 'bg-success/10 text-success', icon: CheckCircle2 },
    complete: { label: 'Complete', className: 'bg-success/10 text-success', icon: CheckCircle2 },
    completed: { label: 'Completed', className: 'bg-success/10 text-success', icon: CheckCircle2 },
    declined: { label: 'Declined', className: 'bg-destructive/10 text-destructive', icon: AlertCircle },
  }
  return config[status] || { label: status, className: 'bg-muted text-muted-foreground', icon: Clock }
}

function getBlockExplorerUrl(chain: string, txHash: string) {
  const explorers: Record<string, string> = {
    'ethereum': 'https://etherscan.io/tx/',
    'polygon': 'https://polygonscan.com/tx/',
    'arbitrum': 'https://arbiscan.io/tx/',
    'optimism': 'https://optimistic.etherscan.io/tx/',
    'base': 'https://basescan.org/tx/'
  }
  return explorers[chain] ? `${explorers[chain]}${txHash}` : null
}

const statusFilters: { id: InvestmentStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Status' },
  { id: 'signed', label: 'Signed' },
  { id: 'wired', label: 'Wired' },
  { id: 'complete', label: 'Complete' },
  { id: 'invited', label: 'Invited' },
  { id: 'declined', label: 'Declined' },
]

function InvestmentDetailDialog({ investment, deal }: { investment: Investment, deal?: Deal }) {
  const statusConfig = getStatusConfig(investment.status)
  const StatusIcon = statusConfig.icon

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar className="size-10 bg-primary/10 text-primary">
            <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
              {investment.dealName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="block">{investment.dealName}</span>
            <span className="text-sm font-normal text-muted-foreground">{deal?.entityName}</span>
          </div>
        </DialogTitle>
        <DialogDescription>Investment details and status</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Status */}
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant="outline" className={cn('gap-1.5', statusConfig.className)}>
            <StatusIcon className="size-3" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Subscription Amount</span>
          <span className="font-semibold">{formatCurrency(investment.subscriptionAmount)}</span>
        </div>

        {/* Capital Wired */}
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Capital Wired</span>
          <span className="font-semibold">
            {investment.capitalWired > 0 ? formatCurrency(investment.capitalWired) : '-'}
          </span>
        </div>

        {/* Management Fee */}
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Management Fee</span>
          <span className="font-medium">{investment.managementFee}%</span>
        </div>

        {/* Carry */}
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Carry</span>
          <span className="font-medium">{investment.carry}%</span>
        </div>

        {/* Investor Info */}
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Investor</span>
          <div className="text-right">
            <span className="font-medium block">{investment.investorName}</span>
            <span className="text-xs text-muted-foreground">{investment.investorEmail}</span>
          </div>
        </div>

        {/* Investor Type */}
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Investor Type</span>
          <Badge variant="outline" className="capitalize text-xs">{investment.investorType}</Badge>
        </div>

        {/* Transaction */}
        {investment.txHash && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Transaction</span>
            <div className="flex items-center gap-2">
              {investment.chain && (
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {investment.chain}
                </Badge>
              )}
              <a 
                href={investment.chain ? getBlockExplorerUrl(investment.chain, investment.txHash) || '#' : '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
              >
                {investment.txHash.slice(0, 6)}...{investment.txHash.slice(-4)}
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Created</span>
          <span className="text-sm">{formatDate(investment.createdAt)}</span>
        </div>

        {investment.signedAt && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Signed</span>
            <span className="text-sm">{formatDate(investment.signedAt)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/deals/${investment.dealId}`}>
            View Deal
            <ExternalLink className="size-3.5 ml-1.5" />
          </Link>
        </Button>
        <Button className="flex-1">
          Download Documents
          <Download className="size-3.5 ml-1.5" />
        </Button>
      </div>
    </DialogContent>
  )
}

export function InvestmentsPage() {
  const [investments, setInvestments] = React.useState<Investment[]>([])
  const [deals, setDeals] = React.useState<Deal[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedStatus, setSelectedStatus] = React.useState<InvestmentStatus | 'all'>('all')

  React.useEffect(() => {
    Promise.all([fetchInvestments(), fetchDeals()])
      .then(([invData, dealsData]) => {
        setInvestments(invData)
        setDeals(dealsData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch', err)
        setLoading(false)
      })
  }, [])

  const filteredInvestments = React.useMemo(() => {
    return investments.filter((inv) => {
      const matchesSearch = 
        inv.dealName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.investorName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, selectedStatus, investments])

  const stats = React.useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.subscriptionAmount, 0)
    const totalWired = investments.reduce((sum, inv) => sum + inv.capitalWired, 0)
    const signedCount = investments.filter(inv => inv.status === 'signed' || inv.status === 'wired' || inv.status === 'complete').length
    return { totalInvested, totalWired, count: investments.length, signedCount }
  }, [investments])

  // TODO: Fetch from actual performance API when available
  const estimatedReturns = 0

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">My Investments</h1>
          <p className="text-sm text-muted-foreground">Track and manage your investment portfolio</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="size-4 mr-1.5" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border bg-primary/5 border-primary/20">
            <CardContent className="px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] font-medium text-primary uppercase tracking-wide">Total Invested</p>
                  <p className="text-lg font-semibold">{formatCurrency(stats.totalInvested)}</p>
                </div>
                <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <DollarSign className="size-3.5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border">
            <CardContent className="px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Capital Wired</p>
                  <p className="text-lg font-semibold">{formatCurrency(stats.totalWired)}</p>
                </div>
                <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <TrendingUp className="size-3.5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border">
            <CardContent className="px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Est. Returns</p>
                  <p className="text-lg font-semibold text-success">{formatCurrency(estimatedReturns)}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <ArrowUpRight className="size-2.5" />
                    +0%
                  </p>
                </div>
                <div className="size-8 rounded-md bg-success/10 flex items-center justify-center shrink-0">
                  <PieChart className="size-3.5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border">
            <CardContent className="px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Active Positions</p>
                  <p className="text-lg font-semibold">{stats.signedCount}</p>
                  <p className="text-[10px] text-muted-foreground">{stats.count} total</p>
                </div>
                <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-3.5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search investments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as InvestmentStatus | 'all')}>
          <SelectTrigger className="w-32 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((filter) => (
              <SelectItem key={filter.id} value={filter.id} className="text-xs">
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card className="border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Deal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Wired</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No investments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvestments.map((inv) => {
                    const statusConfig = getStatusConfig(inv.status)
                    const StatusIcon = statusConfig.icon
                    const deal = deals.find(d => d.id === inv.dealId)

                    return (
                      <TableRow key={inv.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 bg-primary/10 text-primary shrink-0">
                              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                {inv.dealName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{inv.dealName}</p>
                              {deal && (
                                <p className="text-xs text-muted-foreground truncate">{deal.entityName}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs gap-1', statusConfig.className)}>
                            <StatusIcon className="size-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(inv.subscriptionAmount)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {inv.capitalWired > 0 ? formatCurrency(inv.capitalWired) : '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {formatDate(inv.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-xs gap-1.5"
                              >
                                <Eye className="size-3.5" />
                                View
                              </Button>
                            </DialogTrigger>
                            <InvestmentDetailDialog investment={inv} deal={deal} />
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
