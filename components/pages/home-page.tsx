'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Building2,
  Users,
  PieChart,
  ArrowRight,
  MoreHorizontal,
  Wallet,
  ArrowUpRight,
  LineChart,
  Network,
  DollarSign
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/providers/auth-provider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { fetchDeals } from '@/lib/api-client'
import type { Deal } from '@/lib/types'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

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

function DashboardDealCard({ deal }: { deal: Deal }) {
  const fundingProgress = deal.targetRaise > 0 ? Math.min((deal.totalWired / deal.targetRaise) * 100, 100) : 0;
  
  return (
    <Link href={`/deals/${deal.id}`}>
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 group bg-card">
        <CardContent className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-3 min-w-0">
              <Avatar className="size-12 rounded-full bg-amber-500/10 text-amber-500 shrink-0">
                <AvatarFallback className="text-lg font-bold bg-amber-500/10 text-amber-500 rounded-full">
                  {deal.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 pt-0.5">
                <h3 className="font-bold text-sm truncate text-foreground">{deal.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{deal.entityName}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" onClick={(e) => e.preventDefault()}>
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-transparent text-[10px] uppercase font-medium">
              {deal.status.replace('_', ' ')}
            </Badge>
            <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] uppercase font-medium">
              {deal.type}
            </Badge>
          </div>
          
          {/* Progress */}
          <div className="space-y-2 mb-6 mt-auto">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-600 border-transparent">{Math.round(fundingProgress)}%</Badge>
            </div>
            <Progress value={fundingProgress} className="h-1.5 [&>div]:bg-amber-500" />
          </div>
          
          <div className="h-px bg-border/60 w-full mb-4" />
          
          {/* Signed / Wired */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
            <div>
              <p className="text-muted-foreground mb-1">Signed</p>
              <p className="font-bold text-base text-foreground">{formatCurrency(deal.totalSigned)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Wired</p>
              <p className="font-bold text-base text-foreground">{formatCurrency(deal.totalWired)}</p>
            </div>
          </div>
          
          <div className="h-px bg-border/60 w-full mb-4" />
          
          {/* Footer */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="size-4" />
              <span>{deal.investorCount} Investors</span>
            </div>
            <span>{deal.managementFee}% fee</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function HomePage() {
  const [deals, setDeals] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const { requireAuth } = useAuth()
  const router = useRouter()

  const handleProtectedAction = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    if (requireAuth(path)) {
      router.push(path)
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

  // Calculate stats based on deals
  const totalActiveDeals = deals.filter(d => !['closed', 'draft'].includes(d.status)).length || 12; // Fallback to 12 if no data
  const totalInvestors = deals.reduce((acc, curr) => acc + curr.investorCount, 0) || 668;
  const capitalRaised = deals.reduce((acc, curr) => acc + curr.totalWired, 0) || 24800000;
  
  let avgProgress = 48; // Fallback
  if (deals.length > 0) {
    const totalProgress = deals.reduce((acc, curr) => acc + (curr.targetRaise > 0 ? (curr.totalWired / curr.targetRaise) : 0), 0);
    avgProgress = Math.round((totalProgress / deals.length) * 100);
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>
  }

  return (
    <div className="relative overflow-hidden w-full h-full">
      {/* Decorative Dashboard Header Background Pattern */}
      <div className="absolute top-[-50px] right-[-50px] pointer-events-none opacity-40 dark:opacity-20 hidden md:block z-0">
        <svg width="800" height="400" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="650" cy="100" r="150" fill="url(#paint0_radial)" opacity="0.4"/>
          <path d="M200 400 Q500 0 800 300" stroke="#f97316" strokeWidth="0.5" fill="none" />
          <path d="M300 450 Q600 50 900 350" stroke="#f97316" strokeWidth="0.5" fill="none" />
          <path d="M400 500 Q700 100 1000 400" stroke="#f97316" strokeWidth="0.5" fill="none" />
          <path d="M100 150 Q400 300 700 -50" stroke="#f97316" strokeWidth="0.5" fill="none" />
          <circle cx="350" cy="200" r="3" fill="#f97316" />
          <circle cx="550" cy="100" r="4" fill="#f97316" />
          <circle cx="650" cy="250" r="3" fill="#f97316" />
          <circle cx="750" cy="50" r="5" fill="#f97316" />
          <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(650 100) rotate(90) scale(150)">
              <stop stopColor="#ffedd5" />
              <stop offset="1" stopColor="#ffedd5" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-10 relative z-10"
      >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your portfolio overview and investment opportunities
        </p>
      </motion.div>

      {/* Top Action Cards */}
      <motion.div variants={item} className="grid md:grid-cols-3 gap-6 relative z-10">
        {/* Entity Formation */}
        <Card className="overflow-hidden border border-border/40 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] relative group bg-gradient-to-br from-card via-card to-orange-50/60 dark:to-orange-950/30">
          <CardContent className="p-6 flex items-center h-full">
            <div className="flex flex-col justify-start z-10 w-[50%]">
              <div className="w-11 h-8 rounded-xl bg-orange-100/80 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center mb-4">
                <Building2 className="size-4" />
              </div>
              <h3 className="font-bold text-[17px] mb-2 text-foreground">Entity Formation</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed mb-6">
                Instantly form series LLCs and manage entity structures within the platform.
              </p>
              <button onClick={(e) => handleProtectedAction(e, '/entities')} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-orange-600 dark:text-orange-400 mt-auto bg-orange-100/50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 px-4 py-2 rounded-full transition-colors w-fit">
                Create Entity <ArrowRight className="size-3.5" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[50%] h-full flex items-center justify-end pointer-events-none">
              {/* Colored Glow Shadow */}
              <div className="absolute bottom-[20%] right-[10%] w-[120px] h-[40px] bg-orange-500/30 dark:bg-orange-500/20 blur-xl rounded-full" />
              <Image src="/images/entity-formation.png" width={220} height={220} alt="Entity Formation" className="object-contain mr-[-10px] relative z-10 group-hover:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-screen dark:invert dark:hue-rotate-180 dark:opacity-90 dark:brightness-110" />
            </div>
          </CardContent>
        </Card>

        {/* Deal Syndication */}
        <Card className="overflow-hidden border border-border/40 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] relative group bg-gradient-to-br from-card via-card to-blue-50/60 dark:to-blue-950/30">
          <CardContent className="p-6 flex items-center h-full">
            <div className="flex flex-col justify-start z-10 w-[50%]">
              <div className="w-11 h-8 rounded-xl bg-blue-100/80 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center mb-4">
                <Network className="size-4" />
              </div>
              <h3 className="font-bold text-[17px] mb-2 text-foreground">Deal Syndication</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed mb-6">
                Launch deals, invite investors, and track capital commitments.
              </p>
              <button onClick={(e) => handleProtectedAction(e, '/deals')} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-600 dark:text-blue-400 mt-auto bg-blue-100/50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-4 py-2 rounded-full transition-colors w-fit">
                Launch Deal <ArrowRight className="size-3.5" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[50%] h-full flex items-center justify-end pointer-events-none">
              {/* Colored Glow Shadow */}
              <div className="absolute bottom-[20%] right-[10%] w-[120px] h-[40px] bg-blue-500/30 dark:bg-blue-500/20 blur-xl rounded-full" />
              <Image src="/images/deal-syndication.png" width={220} height={220} alt="Deal Syndication" priority className="object-contain mr-[-10px] relative z-10 group-hover:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-screen dark:invert dark:hue-rotate-180 dark:opacity-90 dark:brightness-110" />
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Tracking */}
        <Card className="overflow-hidden border border-border/40 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] relative group bg-gradient-to-br from-card via-card to-emerald-50/60 dark:to-emerald-950/30">
          <CardContent className="p-6 flex items-center h-full">
            <div className="flex flex-col justify-start z-10 w-[50%]">
              <div className="w-11 h-8 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center mb-4">
                <LineChart className="size-4" />
              </div>
              <h3 className="font-bold text-[17px] mb-2 text-foreground">Portfolio Tracking</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed mb-6">
                Monitor investments in real-time and track your total AUM effortlessly.
              </p>
              <button onClick={(e) => handleProtectedAction(e, '/investments')} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 mt-auto bg-emerald-100/50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 px-4 py-2 rounded-full transition-colors w-fit">
                View Portfolio <ArrowRight className="size-3.5" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[50%] h-full flex items-center justify-end pointer-events-none">
              {/* Colored Glow Shadow */}
              <div className="absolute bottom-[20%] right-[10%] w-[120px] h-[40px] bg-emerald-500/30 dark:bg-emerald-500/20 blur-xl rounded-full" />
              <Image src="/images/portfolio-tracking.png" width={220} height={220} alt="Portfolio Tracking" priority className="object-contain mr-[-10px] relative z-10 group-hover:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-screen dark:invert dark:hue-rotate-180 dark:opacity-90 dark:brightness-110" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Featured Opportunities */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">Featured Opportunities</h2>
            <p className="text-sm text-muted-foreground">Explore active deals currently raising capital on Allo.</p>
          </div>
          <Button variant="ghost" className="font-semibold text-foreground hover:bg-muted/50" asChild>
            <Link href="/deals">View All Deals <ArrowRight className="size-4 ml-2" /></Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.slice(0, 3).map((deal, idx) => (
            <DashboardDealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </motion.div>

      {/* Bottom Stats Row */}
      <motion.div variants={item}>
        <Card className="overflow-hidden shadow-sm border-border/50 bg-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
            
            {/* Total Active Deals */}
            <div className="p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors">
              <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center shrink-0">
                <Wallet className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Total Active Deals</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold">{totalActiveDeals}</span>
                </div>
                <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium bg-emerald-500/10 w-fit px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="size-3" /> 20% <span className="text-muted-foreground bg-transparent font-normal ml-1">vs last month</span>
                </p>
              </div>
            </div>

            {/* Total Investors */}
            <div className="p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors">
              <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Total Investors</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold">{totalInvestors}</span>
                </div>
                <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium bg-emerald-500/10 w-fit px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="size-3" /> 15% <span className="text-muted-foreground bg-transparent font-normal ml-1">vs last month</span>
                </p>
              </div>
            </div>

            {/* Capital Raised */}
            <div className="p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors">
              <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center shrink-0">
                <DollarSign className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Capital Raised</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold">{formatCurrency(capitalRaised)}</span>
                </div>
                <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium bg-emerald-500/10 w-fit px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="size-3" /> 32% <span className="text-muted-foreground bg-transparent font-normal ml-1">vs last month</span>
                </p>
              </div>
            </div>

            {/* Avg Deal Progress */}
            <div className="p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors">
              <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center shrink-0">
                <PieChart className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Avg. Deal Progress</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold">{avgProgress}%</span>
                </div>
                <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium bg-emerald-500/10 w-fit px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="size-3" /> 8% <span className="text-muted-foreground bg-transparent font-normal ml-1">vs last month</span>
                </p>
              </div>
            </div>

          </div>
        </Card>
      </motion.div>
    </motion.div>
    </div>
  )
}
