'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUpDown,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchLedgerEntries } from '@/lib/api-client'
import type { LedgerEntryType, LedgerEntryStatus } from '@/lib/types'

function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
  
  return amount < 0 ? `-${formatted}` : formatted
}

function getEntryTypeBadge(type: LedgerEntryType) {
  const config: Record<LedgerEntryType, { label: string; className: string }> = {
    capital_call: { label: 'Capital Call', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    distribution: { label: 'Distribution', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    management_fee: { label: 'Management Fee', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
    carried_interest: { label: 'Carried Interest', className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800' },
    expense: { label: 'Expense', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' },
    adjustment: { label: 'Adjustment', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
  }
  const { label, className } = config[type]
  return <Badge variant="outline" className={cn('text-[10px]', className)}>{label}</Badge>
}

function getStatusBadge(status: LedgerEntryStatus) {
  const config: Record<LedgerEntryStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
    completed: { label: 'Completed', icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
    pending: { label: 'Pending', icon: Clock, className: 'text-amber-600 dark:text-amber-400' },
    failed: { label: 'Failed', icon: XCircle, className: 'text-red-600 dark:text-red-400' },
  }
  const { label, icon: Icon, className } = config[status]
  return (
    <div className={cn('flex items-center gap-1 text-[11px] font-medium', className)}>
      <Icon className="size-3" />
      {label}
    </div>
  )
}

export function LedgerPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [ledgerEntries, setLedgerEntries] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchLedgerEntries()
      .then(data => {
        setLedgerEntries(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch ledger entries', err)
        setLoading(false)
      })
  }, [])

  const filteredEntries = React.useMemo(() => {
    return ledgerEntries.filter((entry) => {
      const matchesSearch = 
        entry.dealName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery, ledgerEntries])

  const stats = React.useMemo(() => {
    const totalInflows = ledgerEntries
      .filter(e => e.amount > 0 && e.status === 'completed')
      .reduce((sum, e) => sum + e.amount, 0)
    
    const totalOutflows = ledgerEntries
      .filter(e => e.amount < 0 && e.status === 'completed')
      .reduce((sum, e) => sum + Math.abs(e.amount), 0)
    
    const pendingTransactions = ledgerEntries.filter(e => e.status === 'pending').length
    
    return {
      totalInflows,
      totalOutflows,
      netBalance: totalInflows - totalOutflows,
      pendingTransactions,
    }
  }, [ledgerEntries])

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">Ledger</h1>
          <p className="text-sm text-muted-foreground">Track all financial transactions across your deals.</p>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-primary uppercase tracking-wide">Net Balance</p>
                  <p className="text-lg font-semibold">{formatCurrency(stats.netBalance)}</p>
                </div>
                <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <DollarSign className="size-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total Inflows</p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalInflows)}</p>
                </div>
                <div className="size-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="size-4 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total Outflows</p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">{formatCurrency(stats.totalOutflows)}</p>
                </div>
                <div className="size-8 rounded-md bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="size-4 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Pending</p>
                  <p className="text-lg font-semibold">{stats.pendingTransactions}</p>
                  <p className="text-[10px] text-muted-foreground">transactions</p>
                </div>
                <div className="size-8 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Clock className="size-4 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
            <Filter className="size-3.5" />
            Filter
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-9">
              <RefreshCw className="size-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">
                      <Button variant="ghost" size="sm" className="-ml-3 h-7 gap-1 text-xs">
                        Date <ArrowUpDown className="size-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs">Deal</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <p className="text-sm text-muted-foreground">No transactions found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id} className="group">
                        <TableCell className="text-xs font-medium">
                          {format(new Date(entry.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{entry.dealName}</TableCell>
                        <TableCell>{getEntryTypeBadge(entry.type)}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate text-muted-foreground">
                          {entry.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {entry.amount > 0 ? (
                              <>
                                <ArrowDownLeft className="size-3 text-emerald-500" />
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(entry.amount)}
                                </span>
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="size-3 text-red-500" />
                                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                  {formatCurrency(entry.amount)}
                                </span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
