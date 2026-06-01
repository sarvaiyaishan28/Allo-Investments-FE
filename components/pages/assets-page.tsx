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
  Plus,
  Edit,
  Trash2,
  Paperclip,
  LayoutGrid,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchAssets, fetchDeals, createAssets, deleteAssets } from '@/lib/api-client'
import type { AssetType, SecurityType } from '@/lib/types'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getAssetTypeBadge(type: AssetType) {
  const labels: Record<AssetType, string> = {
    startup: 'STARTUP',
    spv_into_fund: 'SPV INTO FUND',
    secondary: 'SECONDARY',
    real_estate: 'REAL ESTATE',
  }
  return <Badge variant="outline" className="text-xs uppercase">{labels[type]}</Badge>
}

function getSecurityTypeBadge(type: SecurityType) {
  const labels: Record<SecurityType, string> = {
    preferred_stock: 'Preferred Stock',
    common_stock: 'Common Stock',
    convertible_note: 'Convertible Note',
    safe: 'SAFE',
    secondary: 'Secondary',
  }
  return <Badge variant="outline" className="text-xs">{labels[type]}</Badge>
}

export function AssetsPage() {
  const [assets, setAssets] = React.useState<any[]>([])
  const [deals, setDeals] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterCount, setFilterCount] = React.useState(2)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState<any>({
    legalName: '',
    type: 'startup',
    securityType: 'preferred_stock',
    industry: '',
    location: '',
    totalShares: '',
    sharePrice: '',
    dealId: ''
  })

  const handleCreateAsset = async () => {
    if (!formData.legalName || !formData.location) return;
    try {
      setIsSubmitting(true)
      const newAsset = await createAssets({
        legalName: formData.legalName,
        type: formData.type,
        securityType: formData.securityType,
        industry: formData.industry,
        location: formData.location,
        totalShares: formData.totalShares ? Number(formData.totalShares) : null,
        sharePrice: formData.sharePrice ? Number(formData.sharePrice) : null,
        filesCount: 0
      })
      setAssets([newAsset, ...assets])
      setIsCreateOpen(false)
      setFormData({
        legalName: '',
        type: 'startup',
        securityType: 'preferred_stock',
        industry: '',
        location: '',
        totalShares: '',
        sharePrice: '',
        dealId: ''
      })
    } catch (err) {
      console.error('Failed to create asset:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAssets(id)
      setAssets(assets.filter(a => a.id !== id))
    } catch (err) {
      console.error('Failed to delete asset:', err)
    }
  }

  React.useEffect(() => {
    Promise.all([fetchAssets(), fetchDeals()])
      .then(([a, d]) => {
        setAssets(a)
        setDeals(d)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch', err)
        setLoading(false)
      })
  }, [])

  const filteredAssets = React.useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = asset.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      return matchesSearch
    })
  }, [searchQuery, assets])

  const totalAssets = assets.length

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                TOTAL ASSETS
                <Button variant="ghost" size="icon" className="size-8">
                  <LayoutGrid className="size-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalAssets}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search assets by name, industry or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="size-4" />
            Filter ({filterCount})
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <RefreshCw className="size-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4 mr-2" />
              Create Asset
            </Button>
          </div>
        </motion.div>

        {/* Create Asset Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Asset</DialogTitle>
              <DialogDescription>
                Add a new asset to track investments
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="deal">Select Deal</Label>
                <Select value={formData.dealId} onValueChange={(v) => setFormData({ ...formData, dealId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a deal" />
                  </SelectTrigger>
                  <SelectContent>
                    {deals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="legalName">Legal Name</Label>
                <Input id="legalName" placeholder="Enter legal name" value={formData.legalName} onChange={(e) => setFormData({ ...formData, legalName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="assetType">Asset Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="spv_into_fund">SPV into Fund</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="securityType">Security Type</Label>
                  <Select value={formData.securityType} onValueChange={(v) => setFormData({ ...formData, securityType: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preferred_stock">Preferred Stock</SelectItem>
                      <SelectItem value="common_stock">Common Stock</SelectItem>
                      <SelectItem value="convertible_note">Convertible Note</SelectItem>
                      <SelectItem value="safe">SAFE</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" placeholder="e.g., Technology" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g., San Francisco, CA" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="totalShares">Total Shares</Label>
                  <Input id="totalShares" type="number" placeholder="0" value={formData.totalShares} onChange={(e) => setFormData({ ...formData, totalShares: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sharePrice">Share Price</Label>
                  <Input id="sharePrice" type="number" placeholder="0.00" value={formData.sharePrice} onChange={(e) => setFormData({ ...formData, sharePrice: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateAsset} disabled={isSubmitting || !formData.legalName || !formData.location}>
                {isSubmitting ? 'Creating...' : 'Create Asset'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button variant="ghost" size="sm" className="-ml-3 gap-1">
                      LEGAL NAME <ArrowUpDown className="size-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="-ml-3 gap-1">
                      TYPE <ArrowUpDown className="size-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="-ml-3 gap-1">
                      INDUSTRY <ArrowUpDown className="size-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="-ml-3 gap-1">
                      LOCATION <ArrowUpDown className="size-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="-ml-3 gap-1">
                      SECURITY TYPE <ArrowUpDown className="size-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" className="-mr-3 gap-1">
                      TOTAL SHARES <ArrowUpDown className="size-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" className="-mr-3 gap-1">
                      SHARE PRICE <ArrowUpDown className="size-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="-ml-3 gap-1">
                      FILES <ArrowUpDown className="size-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="-ml-3 gap-1">
                      CREATED <ArrowUpDown className="size-3" />
                    </Button>
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-10 rounded-full shrink-0" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : filteredAssets.map((asset) => (
                  <TableRow key={asset.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
<Avatar className="size-10 bg-primary text-primary-foreground">
                            <AvatarFallback className="text-sm font-semibold bg-primary">
                            {asset.legalName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{asset.legalName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getAssetTypeBadge(asset.type)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.industry || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.location}
                    </TableCell>
                    <TableCell>{getSecurityTypeBadge(asset.securityType)}</TableCell>
                    <TableCell className="text-right">
                      {asset.totalShares?.toLocaleString() || <span className="text-muted-foreground">Missing</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {asset.sharePrice ? formatCurrency(asset.sharePrice) : <span className="text-muted-foreground">Missing</span>}
                    </TableCell>
                    <TableCell>
                      {asset.filesCount > 0 ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Paperclip className="size-4" />
                          {asset.filesCount}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Missing</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(asset.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="size-8">
                          <Edit className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.id); }}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
