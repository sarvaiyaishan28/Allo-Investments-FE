'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search,
  LayoutGrid,
  List,
  ShieldCheck,
  BadgeCheck,
  Lock,
  TrendingUp,
  ChevronDown,
  Building2,
  Users,
  Asterisk,
  Activity,
  ChevronLeft,
  ChevronRight,
  Target,
  CircleDollarSign,
  BarChart3,
  Plus,
  Calendar,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/components/providers/auth-provider'
import { CreateDealDialog } from '@/components/shared/create-deal-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchDeals } from '@/lib/api-client'
import type { DealStatus, DealType, Deal } from '@/lib/types'

// Map product types for filtering
const productTypeFilters: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'standard_spv', label: 'Standard SPV' },
  { id: 'premium_spv', label: 'Premium SPV' },
  { id: 'fund', label: 'Fund' },
]

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`
  }
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
  if (!dateString) return 'TBD'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8 px-8 py-2 md:py-0 border border-border/50 bg-[#fafafa] dark:bg-zinc-950">
      {/* Decorative gradient background elements */}
      <div className="absolute inset-0 opacity-50 dark:opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent -translate-y-1/2 translate-x-1/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent translate-y-1/4 -translate-x-1/4 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="max-w-xl flex-1 py-6 md:py-8">
          <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight mb-3 leading-[1.15] text-zinc-900 dark:text-zinc-50">
            Exclusive private market access,<br />
            <span className="text-[#f15a24] dark:text-[#f15a24]">
              built for modern investors.
            </span>
          </h1>
          <p className="text-muted-foreground text-base mb-0 leading-relaxed max-w-[400px]">
            Discover curated pre-IPO opportunities<br />with institutional-grade access.
          </p>
        </div>

        {/* Illustration Section */}
        <div className="flex-1 flex items-center justify-center md:justify-end w-full">
          {/* Glowing Cube Image */}
          <div className="-my-8 md:-my-12">
             <img 
               src="/images/glowing_cube.png" 
               alt="Glowing Cube" 
               className="w-[220px] md:w-[320px] max-w-none h-auto object-contain pointer-events-none mix-blend-multiply brightness-110 contrast-125 dark:mix-blend-screen dark:invert dark:hue-rotate-180 dark:opacity-90 dark:brightness-110 dark:contrast-100" 
             />
          </div>
        </div>
      </div>
    </div>
  )
}

function ValuePropsFooter() {
  const props = [
    { icon: ShieldCheck, title: "Curated Quality", desc: "Rigorous due diligence on every opportunity" },
    { icon: BadgeCheck, title: "Exclusive Access", desc: "Private-market deals for eligible investors" },
    { icon: Lock, title: "Secure & Compliant", desc: "Institutional-grade security and regulatory compliance" },
    { icon: TrendingUp, title: "Built for Long Term", desc: "Backing the next generation of category leaders" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 p-6 rounded-2xl bg-card border">
      {props.map((prop, i) => {
        const Icon = prop.icon
        return (
          <div key={i} className="flex items-start gap-4 p-2">
            <div className="p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
              <Icon className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">{prop.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{prop.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PremiumDealCard({ deal, index }: { deal: Deal, index: number }) {
  const accents = [
    {
      bgTop: 'bg-[#fff5f0] dark:bg-[#fff5f0]/5',
      avatarBg: 'bg-[#ff5a1f]',
      textPrimary: 'text-[#ff5a1f]',
      borderSoft: 'border-[#ff5a1f]/20',
      pillBg: 'bg-[#fff5f0] dark:bg-[#fff5f0]/10',
    },
    {
      bgTop: 'bg-[#f8f5ff] dark:bg-[#f8f5ff]/5',
      avatarBg: 'bg-[#8b5cf6]',
      textPrimary: 'text-[#8b5cf6]',
      borderSoft: 'border-[#8b5cf6]/20',
      pillBg: 'bg-[#f8f5ff] dark:bg-[#f8f5ff]/10',
    },
    {
      bgTop: 'bg-[#f0f6ff] dark:bg-[#f0f6ff]/5',
      avatarBg: 'bg-[#3b82f6]',
      textPrimary: 'text-[#3b82f6]',
      borderSoft: 'border-[#3b82f6]/20',
      pillBg: 'bg-[#f0f6ff] dark:bg-[#f0f6ff]/10',
    }
  ]
  const accent = accents[index % accents.length]
  const progress = Math.min((deal.totalWired / deal.targetRaise) * 100, 100) || 0

  return (
    <Link href={`/deals/${deal.id}`}>
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 border-border/50 group bg-card rounded-2xl">
        {/* Top Colored Section */}
        <div className={cn("p-6 pb-8", accent.bgTop)}>
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <Avatar className={cn("size-12 rounded-xl text-white shrink-0 border-none shadow-sm", accent.avatarBg)}>
              <AvatarFallback className={cn("text-xl font-bold text-white rounded-xl bg-transparent")}>
                {deal.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <div className={cn("size-1.5 rounded-full", accent.avatarBg)} />
              <span className={cn("text-xs font-semibold capitalize", accent.textPrimary)}>
                {deal.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Titles */}
          <div>
            <h3 className="font-bold text-xl tracking-tight mb-1 text-foreground line-clamp-1">{deal.name}</h3>
            <p className="text-sm text-muted-foreground font-medium mb-4 line-clamp-1">{deal.entityName}</p>
            <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed h-[38px]">
              {deal.memo || "Exclusive investment opportunity offering strategic exposure to early-stage growth and high-potential market expansion."}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 bg-card border-t border-border/40">
          {/* Target Raise */}
          <div className="p-4 border-b border-r border-border/40">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className={cn("size-3.5", accent.textPrimary)} />
              <span className="text-[11px] text-muted-foreground font-medium">Target Raise</span>
            </div>
            <div className="font-bold text-base">{formatCurrency(deal.targetRaise)}</div>
          </div>
          {/* Min Investment */}
          <div className="p-4 border-b border-border/40">
            <div className="flex items-center gap-1.5 mb-1">
              <CircleDollarSign className={cn("size-3.5", accent.textPrimary)} />
              <span className="text-[11px] text-muted-foreground font-medium">Min Investment</span>
            </div>
            <div className="font-bold text-base">{formatCurrency(deal.minimumInvestment)}</div>
          </div>
          {/* Signed */}
          <div className="p-4 border-b border-r border-border/40">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className={cn("size-3.5", accent.textPrimary)} />
              <span className="text-[11px] text-muted-foreground font-medium">Signed</span>
            </div>
            <div className="font-bold text-base">{formatCurrency(deal.totalSigned)}</div>
          </div>
          {/* Round Date */}
          <div className="p-4 border-b border-border/40">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className={cn("size-3.5", accent.textPrimary)} />
              <span className="text-[11px] text-muted-foreground font-medium">Round Date</span>
            </div>
            <div className="font-bold text-base">{formatDate(deal.estimatedClosingDate)}</div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-5 bg-card mt-auto space-y-5">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={cn("text-[10px] font-semibold border-transparent uppercase transition-colors px-2.5 py-0.5", accent.pillBg, accent.textPrimary)}>
              {deal.type}
            </Badge>
            <Badge variant="secondary" className={cn("text-[10px] font-semibold border-transparent transition-colors px-2.5 py-0.5", accent.pillBg, accent.textPrimary)}>
              Accredited only
            </Badge>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 flex-1">
              <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", accent.pillBg)}>
                <BarChart3 className={cn("size-5", accent.textPrimary)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Raise Progress</div>
                <div className="flex items-center gap-2">
                  <span className={cn("font-bold text-base", accent.textPrimary)}>{Math.round(progress)}%</span>
                  <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", accent.avatarBg)} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className={cn("size-8 rounded-full border flex items-center justify-center shrink-0 transition-colors group-hover:bg-muted/50", accent.borderSoft)}>
              <ChevronRight className={cn("size-4", accent.textPrimary)} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function DealsPage() {
  const [deals, setDeals] = React.useState<Deal[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedType, setSelectedType] = React.useState<string>('all')
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid')
  const [ownershipFilter, setOwnershipFilter] = React.useState<'all' | 'my_deals' | 'discover'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)

  const { requireAuth, user, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleCreateDealClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (requireAuth()) {
      setIsCreateDialogOpen(true)
    }
  }

  React.useEffect(() => {
    fetchDeals()
      .then(data => {
        setDeals(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch deals', err)
        setLoading(false)
      })
  }, [])

  const filteredDeals = React.useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch = deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.entityName || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || deal.productType === selectedType || deal.type === selectedType
      
      let matchesOwnership = true
      if (isAuthenticated && user && ownershipFilter !== 'all') {
        if (ownershipFilter === 'my_deals') {
          matchesOwnership = deal.fundManagerId === user.id
        } else if (ownershipFilter === 'discover') {
          matchesOwnership = deal.fundManagerId !== user.id
        }
      }

      return matchesSearch && matchesType && matchesOwnership
    })
  }, [deals, searchQuery, selectedType, ownershipFilter, isAuthenticated, user])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedType, viewMode, ownershipFilter])

  const itemsPerPage = viewMode === 'grid' ? 6 : 10
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage)
  const paginatedDeals = filteredDeals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading curated opportunities...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Deals</h1>
          <p className="text-sm text-muted-foreground">Curated private-market opportunities for ALLO investors</p>
        </div>
        <Button 
          onClick={handleCreateDealClick}
          className="font-medium bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        >
          <Plus className="mr-2 size-4" /> Create Deal
        </Button>
      </div>

      <HeroBanner />

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {isAuthenticated && (
            <>
              <div className="flex items-center bg-muted/50 p-1 rounded-full border">
                <button 
                  onClick={() => setOwnershipFilter('all')} 
                  className={cn("px-3 py-1.5 text-xs font-semibold rounded-full transition-all", ownershipFilter === 'all' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  All
                </button>
                <button 
                  onClick={() => setOwnershipFilter('my_deals')} 
                  className={cn("px-3 py-1.5 text-xs font-semibold rounded-full transition-all", ownershipFilter === 'my_deals' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  My Deals
                </button>
                <button 
                  onClick={() => setOwnershipFilter('discover')} 
                  className={cn("px-3 py-1.5 text-xs font-semibold rounded-full transition-all", ownershipFilter === 'discover' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  Discover
                </button>
              </div>
              <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
            </>
          )}

          {productTypeFilters.map(filter => {
            const isActive = selectedType === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedType(filter.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border",
                  isActive 
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/30" 
                    : "bg-transparent text-muted-foreground border-border hover:border-border/80 hover:bg-muted/50"
                )}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        {/* Search, Sort, View Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-[200px] lg:w-[250px] bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-amber-500/50"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground ml-2">
            <span>Sort by</span>
            <Button variant="outline" size="sm" className="h-9 px-3 gap-2 border-border/50">
              Top Picks <ChevronDown className="size-3" />
            </Button>
          </div>

          <div className="flex border border-border/50 rounded-md overflow-hidden bg-background">
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-9 rounded-none", viewMode === 'grid' ? "bg-amber-500/10 text-amber-500" : "text-muted-foreground")}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-9 rounded-none", viewMode === 'table' ? "bg-amber-500/10 text-amber-500" : "text-muted-foreground")}
              onClick={() => setViewMode('table')}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedDeals.map((deal, idx) => (
            <motion.div 
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PremiumDealCard deal={deal} index={idx} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-border/50 bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Deal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Signed</TableHead>
                    <TableHead className="text-right">Wired</TableHead>
                    <TableHead className="text-right">Investors</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDeals.map((deal) => (
                    <TableRow key={deal.id} className="group hover:bg-muted/50">
                      <TableCell>
                        <Link href={`/deals/${deal.id}`} className="flex items-center gap-3 hover:text-amber-500 transition-colors">
                          <Avatar className="size-8 bg-amber-500/10 text-amber-500 shrink-0">
                            <AvatarFallback className="text-xs font-semibold bg-amber-500/10 text-amber-500">
                              {deal.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{deal.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{deal.entityName}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-medium text-amber-500 border-amber-500/30 bg-amber-500/5 capitalize">
                          {deal.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase text-[10px] text-muted-foreground bg-transparent">
                          {deal.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {formatCurrency(deal.totalSigned)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {formatCurrency(deal.totalWired)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                          <Users className="size-3.5" />
                          {deal.investorCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 hover:text-amber-600 hover:bg-amber-500/10">
                          <Link href={`/deals/${deal.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4 mr-1" /> Previous
          </Button>
          <span className="text-sm font-medium text-muted-foreground mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      )}

      {filteredDeals.length === 0 && (
        <div className="text-center py-20 border border-dashed rounded-2xl border-border/50">
          <Building2 className="size-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No opportunities match your current filters.</p>
          <Button variant="link" onClick={() => setSelectedType('all')} className="text-amber-500">
            Clear filters
          </Button>
        </div>
      )}

      <CreateDealDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      <ValuePropsFooter />
    </div>
  )
}
