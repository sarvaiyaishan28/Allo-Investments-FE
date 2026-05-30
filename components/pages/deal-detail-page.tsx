'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Users,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Share2,
  Send,
  Building2,
  Package,
  Plus,
  Edit2,
  ChevronRight,
  Check,
  Trash2,
  Upload,
  Settings,
  RefreshCw,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert'
import { fetchInvestments } from '@/lib/api-client'
import type { Deal, DealStatus, Investment, InvestmentStatus, Entity, EntityType, EntityStructure, Asset, AssetType, SecurityType } from '@/lib/types'

// US States for entity formation
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
]

// Mock master entities for series
const MASTER_ENTITIES = [
  { id: 'master_1', name: 'Allo Master Series LLC' },
  { id: 'master_2', name: 'Venture Capital Master LLC' },
  { id: 'master_3', name: 'Investment Holdings Master LLC' },
]

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

function getStatusBadge(status: DealStatus) {
  const config: Record<DealStatus, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    submitted: { label: 'Submitted', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    onboarding: { label: 'Open', className: 'bg-success/10 text-success border-success/20' },
    closing: { label: 'Closing', className: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
    close_requested: { label: 'Close Requested', className: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
    closed: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
    test: { label: 'Test', className: 'bg-primary/10 text-primary border-primary/20' },
    migration: { label: 'Migration', className: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  }
  const c = config[status]
  return <Badge variant="outline" className={cn('text-xs', c.className)}>{c.label}</Badge>
}

function getInvestmentStatusBadge(status: InvestmentStatus) {
  const config: Record<InvestmentStatus, { label: string; className: string; icon: React.ElementType }> = {
    invited: { label: 'Invited', className: 'bg-muted text-muted-foreground', icon: Clock },
    viewed: { label: 'Viewed', className: 'bg-sky-500/10 text-sky-600', icon: Clock },
    committed: { label: 'Committed', className: 'bg-primary/10 text-primary', icon: CheckCircle2 },
    signed: { label: 'Signed', className: 'bg-primary/10 text-primary', icon: CheckCircle2 },
    wired: { label: 'Wired', className: 'bg-sky-500/10 text-sky-600', icon: CheckCircle2 },
    complete: { label: 'Complete', className: 'bg-success/10 text-success', icon: CheckCircle2 },
    completed: { label: 'Completed', className: 'bg-success/10 text-success', icon: CheckCircle2 },
    declined: { label: 'Declined', className: 'bg-destructive/10 text-destructive', icon: AlertCircle },
  }
  const c = config[status]
  const Icon = c.icon
  return (
    <Badge variant="outline" className={cn('text-xs gap-1', c.className)}>
      <Icon className="size-3" />
      {c.label}
    </Badge>
  )
}

// ============ EDIT DEAL DIALOG ============

interface EditDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal
  onSave: (data: Partial<Deal>) => void
}

function EditDealDialog({ open, onOpenChange, deal, onSave }: EditDealDialogProps) {
  const [formData, setFormData] = React.useState({
    name: deal.name,
    memo: deal.memo || '',
    targetRaise: deal.targetRaise.toString(),
    minimumInvestment: deal.minimumInvestment.toString(),
    managementFee: deal.managementFee.toString(),
    carry: deal.carry.toString(),
  })
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setFormData({
        name: deal.name,
        memo: deal.memo || '',
        targetRaise: deal.targetRaise.toString(),
        minimumInvestment: deal.minimumInvestment.toString(),
        managementFee: deal.managementFee.toString(),
        carry: deal.carry.toString(),
      })
    }
  }, [open, deal])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onSave({
      name: formData.name,
      memo: formData.memo,
      targetRaise: parseFloat(formData.targetRaise),
      minimumInvestment: parseFloat(formData.minimumInvestment),
      managementFee: parseFloat(formData.managementFee),
      carry: parseFloat(formData.carry),
    })
    setIsSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>Update deal information and terms.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="deal-name" className="text-xs font-medium">Deal Name</Label>
            <Input
              id="deal-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.memo}
              onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
              className="min-h-[80px] resize-none"
              placeholder="Deal description or memo..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="target" className="text-xs font-medium">Target Raise ($)</Label>
              <Input
                id="target"
                type="number"
                value={formData.targetRaise}
                onChange={(e) => setFormData(prev => ({ ...prev, targetRaise: e.target.value }))}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum" className="text-xs font-medium">Minimum Investment ($)</Label>
              <Input
                id="minimum"
                type="number"
                value={formData.minimumInvestment}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumInvestment: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fee" className="text-xs font-medium">Management Fee (%)</Label>
              <Input
                id="fee"
                type="number"
                step="0.1"
                value={formData.managementFee}
                onChange={(e) => setFormData(prev => ({ ...prev, managementFee: e.target.value }))}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carry" className="text-xs font-medium">Carry (%)</Label>
              <Input
                id="carry"
                type="number"
                step="0.1"
                value={formData.carry}
                onChange={(e) => setFormData(prev => ({ ...prev, carry: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ ADD ENTITY DIALOG ============

type EntityStep = 'type' | 'structure' | 'details'

interface AddEntityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (entity: Partial<Entity>) => void
}

function AddEntityDialog({ open, onOpenChange, onSave }: AddEntityDialogProps) {
  const [step, setStep] = React.useState<EntityStep>('type')
  const [entityType, setEntityType] = React.useState<EntityType>('llc')
  const [structure, setStructure] = React.useState<EntityStructure>('independent')
  const [masterEntityId, setMasterEntityId] = React.useState('')
  const [formData, setFormData] = React.useState({
    name: '',
    state: 'Delaware',
    ein: '',
    address: '',
    registeredAgent: '',
  })
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setStep('type')
      setEntityType('llc')
      setStructure('independent')
      setMasterEntityId('')
      setFormData({ name: '', state: 'Delaware', ein: '', address: '', registeredAgent: '' })
      setIsSaving(false)
    }
  }, [open])

  const handleNext = () => {
    if (step === 'type') setStep('structure')
    else if (step === 'structure') setStep('details')
  }

  const handleBack = () => {
    if (step === 'structure') setStep('type')
    else if (step === 'details') setStep('structure')
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    const masterEntity = MASTER_ENTITIES.find(m => m.id === masterEntityId)
    onSave({
      name: formData.name,
      type: entityType,
      structure,
      masterEntityId: structure === 'series' ? masterEntityId : undefined,
      masterEntityName: structure === 'series' ? masterEntity?.name : undefined,
      state: formData.state,
      ein: formData.ein || undefined,
      address: formData.address,
      registeredAgent: formData.registeredAgent || undefined,
    })
    onOpenChange(false)
  }

  const canProceed = () => {
    if (step === 'type') return true
    if (step === 'structure') return structure === 'independent' || !!masterEntityId
    if (step === 'details') return formData.name.trim() && formData.state && formData.address.trim()
    return false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Entity</DialogTitle>
          <DialogDescription>
            {step === 'type' && 'Select the type of legal entity.'}
            {step === 'structure' && 'Choose how this entity will be structured.'}
            {step === 'details' && 'Enter the entity details.'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 py-2">
          {(['type', 'structure', 'details'] as EntityStep[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={cn(
                "flex items-center justify-center size-6 rounded-full text-xs font-medium transition-colors",
                step === s ? "bg-primary text-primary-foreground" :
                i < ['type', 'structure', 'details'].indexOf(step) 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                {i < ['type', 'structure', 'details'].indexOf(step) ? <Check className="size-3" /> : i + 1}
              </div>
              {i < 2 && (
                <div className={cn(
                  "flex-1 h-0.5 transition-colors",
                  i < ['type', 'structure', 'details'].indexOf(step) ? "bg-primary/20" : "bg-muted"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'type' && (
            <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 py-2">
              <RadioGroup value={entityType} onValueChange={(v) => setEntityType(v as EntityType)} className="grid grid-cols-2 gap-3">
                <Label htmlFor="llc" className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all",
                  entityType === 'llc' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                )}>
                  <RadioGroupItem value="llc" id="llc" className="sr-only" />
                  <Building2 className={cn("size-8 mb-2", entityType === 'llc' ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("font-medium text-sm", entityType === 'llc' ? "text-primary" : "text-foreground")}>LLC</span>
                  <span className="text-[10px] text-muted-foreground text-center mt-1">Limited Liability Company</span>
                </Label>
                <Label htmlFor="lp" className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all",
                  entityType === 'lp' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                )}>
                  <RadioGroupItem value="lp" id="lp" className="sr-only" />
                  <Users className={cn("size-8 mb-2", entityType === 'lp' ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("font-medium text-sm", entityType === 'lp' ? "text-primary" : "text-foreground")}>LP</span>
                  <span className="text-[10px] text-muted-foreground text-center mt-1">Limited Partnership</span>
                </Label>
              </RadioGroup>
            </motion.div>
          )}

          {step === 'structure' && (
            <motion.div key="structure" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 py-2">
              <RadioGroup value={structure} onValueChange={(v) => setStructure(v as EntityStructure)} className="space-y-3">
                <Label htmlFor="independent" className={cn(
                  "flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
                  structure === 'independent' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                )}>
                  <RadioGroupItem value="independent" id="independent" className="mt-0.5" />
                  <div className="flex-1">
                    <span className={cn("font-medium text-sm block", structure === 'independent' ? "text-primary" : "text-foreground")}>Independent Entity</span>
                    <span className="text-xs text-muted-foreground mt-1 block">A standalone legal entity with its own EIN and operating agreement.</span>
                  </div>
                </Label>
                <Label htmlFor="series" className={cn(
                  "flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
                  structure === 'series' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                )}>
                  <RadioGroupItem value="series" id="series" className="mt-0.5" />
                  <div className="flex-1">
                    <span className={cn("font-medium text-sm block", structure === 'series' ? "text-primary" : "text-foreground")}>Series under Master</span>
                    <span className="text-xs text-muted-foreground mt-1 block">A series entity under an existing master LLC. Shares the master's EIN.</span>
                  </div>
                </Label>
              </RadioGroup>

              {structure === 'series' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                  <Label className="text-xs font-medium">Select Master Entity</Label>
                  <Select value={masterEntityId} onValueChange={setMasterEntityId}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Choose a master entity" /></SelectTrigger>
                    <SelectContent>
                      {MASTER_ENTITIES.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">The series will inherit the master entity's operating agreement.</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="entity-name" className="text-xs font-medium">Entity Name <span className="text-destructive">*</span></Label>
                <Input id="entity-name" placeholder={entityType === 'llc' ? "e.g., Acme Ventures LLC" : "e.g., Acme Partners LP"} value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="h-10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-xs font-medium">State of Formation <span className="text-destructive">*</span></Label>
                  <Select value={formData.state} onValueChange={(v) => setFormData(prev => ({ ...prev, state: v }))}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{US_STATES.map((state) => (<SelectItem key={state} value={state}>{state}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ein" className="text-xs font-medium">EIN {structure === 'series' && '(uses master)'}</Label>
                  <Input id="ein" placeholder="XX-XXXXXXX" value={formData.ein} onChange={(e) => setFormData(prev => ({ ...prev, ein: e.target.value }))} className="h-10" disabled={structure === 'series'} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-medium">Principal Address <span className="text-destructive">*</span></Label>
                <Textarea id="address" placeholder="123 Main Street, Suite 100&#10;City, State ZIP" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} className="min-h-[80px] resize-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registered-agent" className="text-xs font-medium">Registered Agent</Label>
                <Input id="registered-agent" placeholder="e.g., Corporation Service Company" value={formData.registeredAgent} onChange={(e) => setFormData(prev => ({ ...prev, registeredAgent: e.target.value }))} className="h-10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="gap-2 sm:gap-0">
          {step !== 'type' ? (
            <Button variant="outline" onClick={handleBack}>Back</Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          )}
          {step !== 'details' ? (
            <Button onClick={handleNext} disabled={!canProceed()}>Continue <ChevronRight className="size-4 ml-1" /></Button>
          ) : (
            <Button onClick={handleSave} disabled={!canProceed() || isSaving}>{isSaving ? 'Saving...' : 'Add Entity'}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ ADD ASSET DIALOG ============

interface AddAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (asset: Partial<Asset>) => void
}

function AddAssetDialog({ open, onOpenChange, onSave }: AddAssetDialogProps) {
  const [formData, setFormData] = React.useState({
    legalName: '',
    type: 'startup' as AssetType,
    industry: '',
    location: 'United States',
    securityType: 'preferred_stock' as SecurityType,
    totalShares: '',
    sharePrice: '',
  })
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setFormData({
        legalName: '',
        type: 'startup',
        industry: '',
        location: 'United States',
        securityType: 'preferred_stock',
        totalShares: '',
        sharePrice: '',
      })
      setIsSaving(false)
    }
  }, [open])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onSave({
      legalName: formData.legalName,
      type: formData.type,
      industry: formData.industry || undefined,
      location: formData.location,
      securityType: formData.securityType,
      totalShares: formData.totalShares ? parseInt(formData.totalShares) : undefined,
      sharePrice: formData.sharePrice ? parseFloat(formData.sharePrice) : undefined,
    })
    onOpenChange(false)
  }

  const canSave = formData.legalName.trim() && formData.location.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Asset</DialogTitle>
          <DialogDescription>Add the underlying investment asset for this deal.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="legal-name" className="text-xs font-medium">Legal Name <span className="text-destructive">*</span></Label>
            <Input id="legal-name" placeholder="e.g., Acme Corporation" value={formData.legalName} onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))} className="h-10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="asset-type" className="text-xs font-medium">Asset Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as AssetType }))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="spv_into_fund">SPV into Fund</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-type" className="text-xs font-medium">Security Type</Label>
              <Select value={formData.securityType} onValueChange={(v) => setFormData(prev => ({ ...prev, securityType: v as SecurityType }))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-xs font-medium">Industry</Label>
              <Input id="industry" placeholder="e.g., Technology" value={formData.industry} onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs font-medium">Location <span className="text-destructive">*</span></Label>
              <Input id="location" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} className="h-10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="total-shares" className="text-xs font-medium">Total Shares</Label>
              <Input id="total-shares" type="number" placeholder="e.g., 100000" value={formData.totalShares} onChange={(e) => setFormData(prev => ({ ...prev, totalShares: e.target.value }))} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="share-price" className="text-xs font-medium">Share Price ($)</Label>
              <Input id="share-price" type="number" step="0.01" placeholder="e.g., 10.00" value={formData.sharePrice} onChange={(e) => setFormData(prev => ({ ...prev, sharePrice: e.target.value }))} className="h-10" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave || isSaving}>{isSaving ? 'Saving...' : 'Add Asset'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ STAT CARD ============

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="px-3 py-3">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1.5">
          <Icon className="size-3.5" />
          {label}
        </div>
        <p className="text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

// ============ OVERVIEW TAB ============

interface OverviewTabProps {
  deal: Deal
  entity: Partial<Entity> | null
  assets: Partial<Asset>[]
  onEditDeal: () => void
  onAddEntity: () => void
  onEditEntity: () => void
  onRemoveEntity: () => void
  onAddAsset: () => void
  onRemoveAsset: (index: number) => void
}

function OverviewTab({ 
  deal, 
  entity, 
  assets, 
  onEditDeal,
  onAddEntity, 
  onEditEntity, 
  onRemoveEntity,
  onAddAsset,
  onRemoveAsset 
}: OverviewTabProps) {
  const progress = Math.min((deal.totalWired / deal.targetRaise) * 100, 100)
  const missingEntity = !entity
  const missingAssets = assets.length === 0
  const hasMissingRequirements = missingEntity || missingAssets

  return (
    <div className="space-y-4">
      {/* Missing requirements alert */}
      {hasMissingRequirements && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-sm">
            <span className="font-medium">Missing requirements:</span>{' '}
            {missingEntity && 'Add an entity (required for registry). '}
            {missingAssets && 'Add at least one asset.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Card */}
      <Card>
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Funding Progress</p>
              <p className="text-xl font-bold">
                {formatCurrency(deal.totalWired)} 
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  of {formatCurrency(deal.targetRaise)}
                </span>
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
          </div>
          <Progress value={progress} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Signed" value={formatCurrency(deal.totalSigned)} icon={FileText} />
        <StatCard label="Wired" value={formatCurrency(deal.totalWired)} icon={DollarSign} />
        <StatCard label="Investors" value={deal.investorCount.toString()} icon={Users} />
        <StatCard label="Min. Investment" value={formatCurrency(deal.minimumInvestment)} icon={TrendingUp} />
      </div>

      {/* Entity & Assets Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Entity Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                Entity
              </CardTitle>
              {!entity && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onAddEntity}>
                  <Plus className="size-3 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {entity ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{entity.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entity.type?.toUpperCase()} - {entity.state}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge variant="outline" className="text-[10px] capitalize">{entity.structure}</Badge>
                      {entity.structure === 'series' && entity.masterEntityName && (
                        <span className="text-[10px] text-muted-foreground">under {entity.masterEntityName}</span>
                      )}
                    </div>
                  </div>
                </div>
                {entity.address && (
                  <p className="text-xs text-muted-foreground">{entity.address}</p>
                )}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onEditEntity}>
                    <Edit2 className="size-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={onRemoveEntity}>
                    <Trash2 className="size-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Building2 className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">No entity added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assets Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" />
                Assets
                {assets.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] ml-1">{assets.length}</Badge>
                )}
              </CardTitle>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onAddAsset}>
                <Plus className="size-3 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assets.length > 0 ? (
              <div className="space-y-2">
                {assets.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded bg-muted flex items-center justify-center">
                        <Package className="size-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{asset.legalName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {asset.type?.replace('_', ' ')} - {asset.securityType?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" onClick={() => onRemoveAsset(index)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Package className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">No assets added yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deal Details */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Deal Details</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onEditDeal}>
              <Edit2 className="size-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="flex justify-between py-1.5 border-b border-dashed">
            <span className="text-muted-foreground">Entity</span>
            <span className="font-medium text-right">{deal.entityName}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-dashed">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium uppercase">{deal.type}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-dashed">
            <span className="text-muted-foreground">Offering</span>
            <span className="font-medium uppercase">{deal.offeringType}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-dashed">
            <span className="text-muted-foreground">Management Fee</span>
            <span className="font-medium">{deal.managementFee}%</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-dashed">
            <span className="text-muted-foreground">Carry</span>
            <span className="font-medium">{deal.carry}%</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-dashed">
            <span className="text-muted-foreground">Est. Closing</span>
            <span className="font-medium">{formatDate(deal.estimatedClosingDate)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Memo */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Memo</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onEditDeal}>
              <Edit2 className="size-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{deal.memo || 'No memo added yet'}</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ============ INVESTORS TAB ============

function InvestorsTab({ dealInvestments }: { dealInvestments: Investment[] }) {
  if (dealInvestments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="size-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">No investors yet</p>
          <Button variant="outline" size="sm">
            <Send className="size-3.5 mr-1.5" />
            Invite Investor
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px]">Investor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Wired</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealInvestments.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {inv.investorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{inv.investorName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{inv.investorEmail}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {inv.investorType}
                  </Badge>
                </TableCell>
                <TableCell>{getInvestmentStatusBadge(inv.status)}</TableCell>
                <TableCell className="text-right font-medium text-sm">
                  {formatCurrency(inv.subscriptionAmount)}
                </TableCell>
                <TableCell className="text-right font-medium text-sm">
                  {inv.capitalWired > 0 ? formatCurrency(inv.capitalWired) : '-'}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                  {formatDate(inv.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

// ============ DOCUMENTS TAB ============

function DocumentsTab() {
  const [documents, setDocuments] = React.useState<Array<{
    id: string
    name: string
    type: 'pitch_deck' | 'memo' | 'legal' | 'financials' | 'other'
    size: number
    uploadedAt: string
  }>>([
    { id: '1', name: 'Pitch Deck - Series A.pdf', type: 'pitch_deck', size: 4500000, uploadedAt: '2024-01-15' },
    { id: '2', name: 'Deal Memo.pdf', type: 'memo', size: 1200000, uploadedAt: '2024-01-10' },
  ])
  const [uploadingType, setUploadingType] = React.useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pitch_deck': return <TrendingUp className="size-4 text-blue-500" />
      case 'memo': return <FileText className="size-4 text-amber-500" />
      case 'legal': return <FileText className="size-4 text-purple-500" />
      case 'financials': return <DollarSign className="size-4 text-emerald-500" />
      default: return <FileText className="size-4 text-muted-foreground" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pitch_deck': return 'Pitch Deck'
      case 'memo': return 'Deal Memo'
      case 'legal': return 'Legal'
      case 'financials': return 'Financials'
      default: return 'Other'
    }
  }

  const documentTypes = [
    { value: 'pitch_deck', label: 'Pitch Deck', description: 'Company presentation slides' },
    { value: 'memo', label: 'Deal Memo', description: 'Investment thesis and analysis' },
    { value: 'legal', label: 'Legal Document', description: 'Contracts, agreements, terms' },
    { value: 'financials', label: 'Financials', description: 'Financial statements and projections' },
    { value: 'other', label: 'Other', description: 'Any other supporting document' },
  ]

  const handleFileUpload = (type: string) => {
    // Simulate file upload
    setUploadingType(type)
    setTimeout(() => {
      const newDoc = {
        id: Date.now().toString(),
        name: `New ${getTypeLabel(type)}.pdf`,
        type: type as typeof documents[0]['type'],
        size: Math.floor(Math.random() * 5000000) + 500000,
        uploadedAt: new Date().toISOString().split('T')[0],
      }
      setDocuments(prev => [...prev, newDoc])
      setUploadingType(null)
    }, 1500)
  }

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Upload Documents</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {documentTypes.map((docType) => (
              <button
                key={docType.value}
                onClick={() => handleFileUpload(docType.value)}
                disabled={uploadingType !== null}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border border-dashed text-left transition-colors",
                  "hover:border-primary/50 hover:bg-primary/5",
                  uploadingType === docType.value && "border-primary bg-primary/5"
                )}
              >
                <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  {uploadingType === docType.value ? (
                    <RefreshCw className="size-4 animate-spin text-primary" />
                  ) : (
                    <Upload className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium">{docType.label}</p>
                  <p className="text-[10px] text-muted-foreground">{docType.description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Uploaded Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {documents.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a pitch deck or deal memo to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group"
                >
                  <div className="size-9 rounded-md bg-background flex items-center justify-center shrink-0 border">
                    {getTypeIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{getTypeLabel(doc.type)}</Badge>
                      <span className="text-[10px] text-muted-foreground">{formatFileSize(doc.size)}</span>
                      <span className="text-[10px] text-muted-foreground">Uploaded {doc.uploadedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="size-7">
                      <Download className="size-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveDocument(doc.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============ MAIN COMPONENT ============

interface DealDetailPageProps {
  deal: Deal
  isAdmin?: boolean
}

export function DealDetailPage({ deal, isAdmin = true }: DealDetailPageProps) {
  const [investments, setInvestments] = React.useState<Investment[]>([])
  
  React.useEffect(() => {
    fetchInvestments().then(data => {
      setInvestments(data.filter((inv: Investment) => inv.dealId === deal.id))
    }).catch(console.error)
  }, [deal.id])
  
  const dealInvestments = investments
  
  // Admin state
  const [entity, setEntity] = React.useState<Partial<Entity> | null>(null)
  const [assets, setAssets] = React.useState<Partial<Asset>[]>([])
  const [editDealOpen, setEditDealOpen] = React.useState(false)
  const [addEntityOpen, setAddEntityOpen] = React.useState(false)
  const [addAssetOpen, setAddAssetOpen] = React.useState(false)

  const handleSaveEntity = (newEntity: Partial<Entity>) => {
    setEntity(newEntity)
  }

  const handleSaveAsset = (newAsset: Partial<Asset>) => {
    setAssets(prev => [...prev, newAsset])
  }

  const handleRemoveAsset = (index: number) => {
    setAssets(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href="/deals" 
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="size-11 bg-primary/10 text-primary shrink-0">
              <AvatarFallback className="text-base font-bold bg-primary/10 text-primary">
                {deal.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg md:text-xl font-bold">{deal.name}</h1>
              <p className="text-xs text-muted-foreground mb-2">{deal.entityName}</p>
              <div className="flex items-center gap-1.5">
                {getStatusBadge(deal.status)}
                <Badge variant="outline" className="uppercase text-[10px]">{deal.type}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Share2 className="size-3.5 mr-1.5" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-xs">
                  <Download className="size-3.5 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs">
                  <Send className="size-3.5 mr-2" />
                  Invite Investor
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs">
                  <Settings className="size-3.5 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-9 p-1 bg-muted/50">
          <TabsTrigger value="overview" className="text-xs h-7">Overview</TabsTrigger>
          <TabsTrigger value="investors" className="text-xs h-7">
            Investors
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 h-4">{dealInvestments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs h-7">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab 
            deal={deal} 
            entity={entity}
            assets={assets}
            onEditDeal={() => setEditDealOpen(true)}
            onAddEntity={() => setAddEntityOpen(true)}
            onEditEntity={() => setAddEntityOpen(true)}
            onRemoveEntity={() => setEntity(null)}
            onAddAsset={() => setAddAssetOpen(true)}
            onRemoveAsset={handleRemoveAsset}
          />
        </TabsContent>

        <TabsContent value="investors">
          <InvestorsTab dealInvestments={dealInvestments} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditDealDialog 
        open={editDealOpen} 
        onOpenChange={setEditDealOpen} 
        deal={deal}
        onSave={(data) => console.log('Save deal:', data)}
      />
      <AddEntityDialog 
        open={addEntityOpen} 
        onOpenChange={setAddEntityOpen}
        onSave={handleSaveEntity}
      />
      <AddAssetDialog 
        open={addAssetOpen} 
        onOpenChange={setAddAssetOpen}
        onSave={handleSaveAsset}
      />
    </div>
  )
}
