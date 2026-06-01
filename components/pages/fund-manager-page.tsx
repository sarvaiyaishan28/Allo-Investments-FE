"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  TrendingUp, Users, FileText, Plus, Search, MoreHorizontal, 
  Filter, Download, ArrowUpRight, Building2, DollarSign,
  CheckCircle2, Clock, AlertCircle, Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { CreateDealDialog } from "@/components/shared/create-deal-dialog"
import { fetchDeals } from "@/lib/api-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

interface FundManagerDeal {
  id: string
  name: string
  entity: string
  status: "Draft" | "Submitted" | "Onboarding" | "Closing" | "Close Requested" | "Closed" | "Test"
  type: "SPV" | "FUND"
  managementFee: string
  carry: string
  totalSigned: number
  totalWired: number
  investors: number
  legals: boolean
  bankAccount: boolean
}

const statusConfig: Record<string, { color: string; bgColor: string }> = {
  "Draft": { color: "text-muted-foreground", bgColor: "bg-muted" },
  "Submitted": { color: "text-amber-600", bgColor: "bg-amber-500" },
  "Onboarding": { color: "text-primary", bgColor: "bg-primary" },
  "Closing": { color: "text-blue-600", bgColor: "bg-blue-500" },
  "Close Requested": { color: "text-purple-600", bgColor: "bg-purple-500" },
  "Closed": { color: "text-emerald-600", bgColor: "bg-emerald-500" },
  "Test": { color: "text-muted-foreground", bgColor: "bg-muted" },
}

export function FundManagerPage() {
  const [activeTab, setActiveTab] = useState("deals")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string[]>(["Draft", "Submitted", "Onboarding", "Closing", "Close Requested", "Closed"])
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const [deals, setDeals] = useState<FundManagerDeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDeals() {
      try {
        const data = await fetchDeals()
        const mappedDeals = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          entity: d.entityName,
          status: d.status,
          type: d.type.toUpperCase(),
          managementFee: `${d.managementFee}%`,
          carry: `${d.carry}%`,
          totalSigned: d.totalSigned || 0,
          totalWired: d.totalWired || 0,
          investors: d.investorCount || 0,
          legals: true, // Placeholder until schema supports it
          bankAccount: true, // Placeholder until schema supports it
        }))
        setDeals(mappedDeals)
        setLoading(false)
      } catch (err) {
        console.error("Failed to load deals:", err)
        setLoading(false)
      }
    }
    loadDeals()
  }, [])

  const totalAUM = deals.reduce((acc, deal) => acc + deal.totalWired, 0)
  const totalInvestors = deals.reduce((acc, deal) => acc + deal.investors, 0)
  const totalDeals = deals.length

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          deal.entity.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter.includes(deal.status)
    const matchesType = typeFilter === "all" || deal.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const toggleStatus = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fund Manager Dashboard</h1>
          <p className="text-muted-foreground">Manage your deals, investors, and portfolio</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90" 
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Asset Under Management</p>
                <p className="text-3xl font-bold">${totalAUM.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investors</p>
                <p className="text-3xl font-bold">{totalInvestors}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-3xl font-bold">{totalDeals}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by deal name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter ({statusFilter.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {Object.keys(statusConfig).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className="gap-2"
                  >
                    <Checkbox checked={statusFilter.includes(status)} />
                    <span>{status}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["Draft", "Submitted", "Onboarding", "Closing", "Close Requested", "Closed", "Test"].map((status) => (
            <Button
              key={status}
              variant={statusFilter.includes(status) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStatus(status)}
              className={statusFilter.includes(status) ? `${statusConfig[status].bgColor} text-white hover:opacity-90` : ""}
            >
              {status}
            </Button>
          ))}
          <div className="h-6 w-px bg-border mx-2" />
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("all")}
            className={typeFilter === "all" ? "bg-muted text-foreground hover:bg-muted/80" : ""}
          >
            All
          </Button>
          <Button
            variant={typeFilter === "SPV" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("SPV")}
            className={typeFilter === "SPV" ? "bg-muted text-foreground hover:bg-muted/80" : ""}
          >
            SPV
          </Button>
          <Button
            variant={typeFilter === "FUND" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("FUND")}
            className={typeFilter === "FUND" ? "bg-muted text-foreground hover:bg-muted/80" : ""}
          >
            FUND
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTypeFilter("Migration")}
          >
            Migration
          </Button>
        </div>
      </div>

      {/* Deals Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Deal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Management Fee</TableHead>
                <TableHead className="text-right">Carry</TableHead>
                <TableHead className="text-right">Total Signed</TableHead>
                <TableHead className="text-right">Total Wired</TableHead>
                <TableHead className="text-right">Investors</TableHead>
                <TableHead className="text-center">Legals</TableHead>
                <TableHead className="text-center">Bank</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 rounded-md ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredDeals.map((deal, index) => (
                <motion.tr
                  key={deal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group"
                >
                  <TableCell>
                    <Link href={`/deals/${deal.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                        {deal.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{deal.name}</p>
                        <p className="text-xs text-muted-foreground">{deal.entity}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${(statusConfig[deal.status] || statusConfig["Test"]).bgColor} text-white border-0`}>
                      {deal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{deal.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{deal.managementFee}</TableCell>
                  <TableCell className="text-right font-medium">{deal.carry}</TableCell>
                  <TableCell className="text-right font-medium">${deal.totalSigned.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">${deal.totalWired.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{deal.investors}</TableCell>
                  <TableCell className="text-center">
                    {deal.legals ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {deal.bankAccount ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10">
                      Actions
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!loading && filteredDeals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">No deals found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Schedule Content */}
      {activeTab === "schedule" && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Schedule</h3>
            <p>Upcoming milestones and tasks will appear here.</p>
          </CardContent>
        </Card>
      )}

      <CreateDealDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}
