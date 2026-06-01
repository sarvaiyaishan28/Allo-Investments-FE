"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Search, MoreHorizontal, Edit, Trash2, 
  FileText, Users, ChevronDown, Filter, Download, ExternalLink,
  CheckCircle2, AlertCircle, Clock, LayoutGrid, List
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
import { Skeleton } from "@/components/ui/skeleton"
import { fetchEntities, createEntities, deleteEntities, fetchDeals } from "@/lib/api-client"

const statusConfig = {
  Active: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  Pending: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  Inactive: { color: "bg-muted text-muted-foreground border-border", icon: AlertCircle },
}

const getEntityStatusConfig = (status: string) => {
  if (!status) return statusConfig.Pending;
  const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  return statusConfig[normalized as keyof typeof statusConfig] || statusConfig.Pending;
}

export function EntitiesPage() {
  const [entities, setEntities] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'llc',
    state: 'delaware',
    ein: '',
    dealId: ''
  })

  const handleCreateEntity = async () => {
    if (!formData.name) return;
    try {
      setIsSubmitting(true)
      const newEntity = await createEntities({
        name: formData.name,
        type: formData.type,
        state: formData.state,
        ein: formData.ein || null,
        structure: 'independent',
        address: ''
      })
      setEntities([newEntity, ...entities])
      setIsCreateOpen(false)
      setFormData({
        name: '',
        type: 'llc',
        state: 'delaware',
        ein: '',
        dealId: ''
      })
    } catch (err) {
      console.error('Failed to create entity:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEntity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;
    try {
      await deleteEntities(id)
      setEntities(entities.filter(e => e.id !== id))
    } catch (err) {
      console.error('Failed to delete entity:', err)
    }
  }

  React.useEffect(() => {
    fetchEntities()
      .then(data => {
        setEntities(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch entities', err)
        setLoading(false)
      })

    fetchDeals()
      .then(data => {
        setDeals(data || [])
      })
      .catch(err => console.error('Failed to fetch deals', err))
  }, [])

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || entity.type.toLowerCase() === typeFilter.toLowerCase()
    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    })
  }

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Entities</h1>
          <p className="text-muted-foreground">Manage your legal entities and business structures</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Entity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Entity</DialogTitle>
              <DialogDescription>
                Set up a new legal entity for your investments
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="deal">Select Deal (Optional)</Label>
                <Select value={formData.dealId} onValueChange={(v) => setFormData({ ...formData, dealId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a deal" />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Deal</SelectItem>
                      {deals.map(deal => (
                        <SelectItem key={deal.id} value={deal.id}>{deal.name}</SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Entity Name</Label>
                <Input id="name" placeholder="Enter entity name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Entity Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="lp">LP</SelectItem>
                      <SelectItem value="trust">Trust</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delaware">Delaware</SelectItem>
                      <SelectItem value="nevada">Nevada</SelectItem>
                      <SelectItem value="wyoming">Wyoming</SelectItem>
                      <SelectItem value="california">California</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ein">EIN (Optional)</Label>
                <Input id="ein" placeholder="XX-XXXXXXX" value={formData.ein} onChange={(e) => setFormData({ ...formData, ein: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateEntity} disabled={isSubmitting || !formData.name}>
                {isSubmitting ? 'Creating...' : 'Create Entity'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Total Entities</p>
                <p className="text-3xl font-bold">{entities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold">{entities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-3xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="LLC">LLC</SelectItem>
              <SelectItem value="Corporation">Corporation</SelectItem>
              <SelectItem value="LP">LP</SelectItem>
              <SelectItem value="Trust">Trust</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
<Button variant="outline" size="icon">
  <Download className="h-4 w-4" />
  </Button>
  <div className="flex border rounded-md">
    <Button
      variant={viewMode === "list" ? "secondary" : "ghost"}
      size="icon"
      className="rounded-r-none"
      onClick={() => setViewMode("list")}
    >
      <List className="h-4 w-4" />
    </Button>
    <Button
      variant={viewMode === "grid" ? "secondary" : "ghost"}
      size="icon"
      className="rounded-l-none"
      onClick={() => setViewMode("grid")}
    >
      <LayoutGrid className="h-4 w-4" />
    </Button>
  </div>
  </div>
  </div>
  
  {/* Entity Table View */}
  {viewMode === "list" && (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Jurisdiction</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>EIN</TableHead>
            <TableHead>Deals</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : filteredEntities.map((entity) => {
            const config = getEntityStatusConfig(entity.status)
            const StatusIcon = config.icon
            return (
              <TableRow key={entity.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary text-sm">
                      {entity.name.charAt(0)}
                    </div>
                    <span className="font-medium">{entity.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground uppercase">{entity.type}</TableCell>
                <TableCell className="text-muted-foreground">{entity.state}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={config.color}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {entity.status ? entity.status.charAt(0).toUpperCase() + entity.status.slice(1).toLowerCase() : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {entity.ein || "-"}
                </TableCell>
                <TableCell>0</TableCell>
                <TableCell>0</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Entity
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        Documents
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteEntity(entity.id); }}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )}

  {/* Entity Grid */}
  {viewMode === "grid" && (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <motion.div key={`skeleton-${i}`}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 rounded-lg shrink-0" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-md shrink-0" />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                      <div className="text-center flex flex-col items-center">
                        <Skeleton className="h-6 w-6 mb-1" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                      <div className="text-center flex flex-col items-center">
                        <Skeleton className="h-6 w-6 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="text-center flex flex-col items-center">
                        <Skeleton className="h-6 w-12 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : filteredEntities.map((entity, index) => {
            const config = getEntityStatusConfig(entity.status)
            const StatusIcon = config.icon
            return (
              <motion.div
                key={entity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                          {entity.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {entity.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {entity.type.toUpperCase()} • {entity.state}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Entity
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Documents
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteEntity(entity.id); }}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={config.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {entity.status ? entity.status.charAt(0).toUpperCase() + entity.status.slice(1).toLowerCase() : "Pending"}
                      </Badge>
                      {entity.ein && (
                        <Badge variant="secondary" className="font-mono text-xs">
                          EIN: {entity.ein}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold">0</p>
                        <p className="text-xs text-muted-foreground">Deals</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">0</p>
                        <p className="text-xs text-muted-foreground">Documents</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{entity.formationDate ? formatDate(entity.formationDate) : "-"}</p>
                        <p className="text-xs text-muted-foreground">Formed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
</AnimatePresence>
  </div>
  )}

      {!loading && filteredEntities.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No entities found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
