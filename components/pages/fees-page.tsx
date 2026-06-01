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
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Percent,
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
import { fetchFees } from '@/lib/api-client'
import type { FeeType, FeeStatus } from '@/lib/types'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getFeeTypeBadge(type: FeeType) {
  const config: Record<FeeType, { label: string; className: string }> = {
    management_fee: { label: 'Management', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    performance_fee: { label: 'Performance', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    formation_fee: { label: 'Formation', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
    administrative_fee: { label: 'Admin', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    other: { label: 'Other', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
  }
  const { label, className } = config[type]
  return <Badge variant="outline" className={cn('text-[10px]', className)}>{label}</Badge>
}

function getStatusBadge(status: FeeStatus) {
  const config: Record<FeeStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
    paid: { label: 'Paid', icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
    pending: { label: 'Pending', icon: Clock, className: 'text-amber-600 dark:text-amber-400' },
    waived: { label: 'Waived', icon: CheckCircle2, className: 'text-gray-500' },
    overdue: { label: 'Overdue', icon: AlertCircle, className: 'text-red-600 dark:text-red-400' },
  }
  const { label, icon: Icon, className } = config[status]
  return (
    <div className={cn('flex items-center gap-1 text-[11px] font-medium', className)}>
      <Icon className="size-3" />
      {label}
    </div>
  )
}

export function FeesPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [fees, setFees] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchFees()
      .then(data => {
        setFees(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch fees', err)
        setLoading(false)
      })
  }, [])

  const filteredFees = React.useMemo(() => {
    return fees.filter((fee) => {
      const matchesSearch = 
        fee.dealName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery, fees])

  const stats = React.useMemo(() => {
    const totalFees = fees.reduce((sum, f) => sum + f.amount, 0)
    const paidFees = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0)
    const pendingFees = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0)
    const overdueFees = fees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0)
    
    return { totalFees, paidFees, pendingFees, overdueFees }
  }, [fees])

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">Fees</h1>
          <p className="text-sm text-muted-foreground">Track and manage fees across all your deals.</p>
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
                  <p className="text-[10px] font-medium text-primary uppercase tracking-wide">Total Fees</p>
                  <p className="text-lg font-semibold">{formatCurrency(stats.totalFees)}</p>
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
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Paid</p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.paidFees)}</p>
                </div>
                <div className="size-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Pending</p>
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(stats.pendingFees)}</p>
                </div>
                <div className="size-8 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Clock className="size-4 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Overdue</p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">{formatCurrency(stats.overdueFees)}</p>
                </div>
                <div className="size-8 rounded-md bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="size-4 text-red-500" />
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
              placeholder="Search fees..."
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
                        Due Date <ArrowUpDown className="size-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs">Deal</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Paid Date</TableHead>
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
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredFees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <p className="text-sm text-muted-foreground">No fees found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFees.map((fee) => (
                      <TableRow key={fee.id} className="group">
                        <TableCell className="text-xs font-medium">
                          {format(new Date(fee.dueDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{fee.dealName}</TableCell>
                        <TableCell>{getFeeTypeBadge(fee.type)}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate text-muted-foreground">
                          {fee.description}
                        </TableCell>
                        <TableCell className="text-xs text-right font-semibold">
                          {formatCurrency(fee.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(fee.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {fee.paidDate ? format(new Date(fee.paidDate), 'MMM d, yyyy') : '—'}
                        </TableCell>
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
