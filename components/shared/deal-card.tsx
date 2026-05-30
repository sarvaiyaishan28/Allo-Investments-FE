import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Deal, DealStatus } from '@/lib/types'

export function formatCurrency(amount: number) {
  if (amount === 0) return '$0'
  if (amount >= 1000000) {
    const formatted = (amount / 1000000).toFixed(1)
    return `$${formatted.replace(/\.0$/, '')}M`
  }
  if (amount >= 1000) {
    const formatted = (amount / 1000).toFixed(0)
    return `$${formatted}K`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getStatusBadge(status: DealStatus) {
  const statusConfig: Record<DealStatus, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-transparent' },
    submitted: { label: 'Submitted', className: 'bg-orange-100 text-orange-600 border-transparent dark:bg-orange-900/30 dark:text-orange-400' },
    onboarding: { label: 'Onboarding', className: 'bg-orange-100 text-orange-600 border-transparent dark:bg-orange-900/30 dark:text-orange-400' },
    closing: { label: 'Closing', className: 'bg-sky-100 text-sky-600 border-transparent dark:bg-sky-900/30 dark:text-sky-400' },
    close_requested: { label: 'Close Requested', className: 'bg-violet-100 text-violet-600 border-transparent dark:bg-violet-900/30 dark:text-violet-400' },
    closed: { label: 'Closed', className: 'bg-muted text-muted-foreground border-transparent' },
    test: { label: 'Test', className: 'bg-orange-100 text-orange-600 border-transparent dark:bg-orange-900/30 dark:text-orange-400' },
    migration: { label: 'Migration', className: 'bg-violet-100 text-violet-600 border-transparent dark:bg-violet-900/30 dark:text-violet-400' },
  }
  const config = statusConfig[status]
  return <Badge variant="outline" className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', config.className)}>{config.label}</Badge>
}

export function DealCard({ deal }: { deal: Deal }) {
  const fundingProgress = Math.min((deal.totalWired / deal.targetRaise) * 100, 100)

  return (
    <Link href={`/deals/${deal.id}`} className="block h-full">
      <Card className="h-full transition-all hover:border-orange-500/30 hover:shadow-sm cursor-pointer rounded-xl">
        <CardContent className="p-5 flex flex-col h-full">
          {/* Avatar and Title */}
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="size-11 bg-orange-100 text-orange-500 shrink-0">
              <AvatarFallback className="text-sm font-semibold bg-orange-100 text-orange-500 dark:bg-orange-950 dark:text-orange-400">
                {deal.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="font-bold text-[15px] truncate">{deal.name}</h3>
              <p className="text-[13px] text-muted-foreground truncate mt-0.5">{deal.entityName}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-6">
            {getStatusBadge(deal.status)}
            <Badge variant="outline" className="uppercase text-[11px] font-medium text-muted-foreground px-2 py-0.5 rounded-full border-border/80">
              {deal.type}
            </Badge>
          </div>

          {/* Progress Section */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-bold">{Math.round(fundingProgress)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${Math.round(fundingProgress)}%` }}
              />
            </div>
          </div>

          <div className="mt-auto">
            {/* Stats: Signed and Wired */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <p className="text-[13px] text-muted-foreground font-medium">Signed</p>
                <p className="font-bold text-[15px]">{formatCurrency(deal.totalSigned)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[13px] text-muted-foreground font-medium">Wired</p>
                <p className="font-bold text-[15px]">{formatCurrency(deal.totalWired)}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-4 text-[13px]">
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <Users className="size-4" />
                {deal.investorCount}
              </div>
              <span className="text-muted-foreground font-medium">{deal.managementFee}% fee</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
