'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  Package,
  Plus,
  Settings,
  Users,
  FileText,
  DollarSign,
  Edit2,
  ChevronRight,
  Check,
  AlertCircle,
  Trash2,
  ExternalLink,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
import type { Deal, DealStatus, Entity, EntityType, EntityStructure, Asset, AssetType, SecurityType } from '@/lib/types'
import { updateDeal } from '@/lib/api-client'

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

function getStatusBadge(status: DealStatus) {
  const config: Record<DealStatus, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    submitted: { label: 'Submitted', className: 'bg-warning/10 text-warning border-warning/20' },
    onboarding: { label: 'Open', className: 'bg-success/10 text-success border-success/20' },
    closing: { label: 'Closing', className: 'bg-warning/10 text-warning border-warning/20' },
    close_requested: { label: 'Close Requested', className: 'bg-muted text-muted-foreground' },
    closed: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
    test: { label: 'Test', className: 'bg-primary/10 text-primary border-primary/20' },
    migration: { label: 'Migration', className: 'bg-muted text-muted-foreground' },
  }
  const c = config[status]
  return <Badge variant="outline" className={cn('text-[10px] font-medium', c.className)}>{c.label}</Badge>
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
      setFormData({
        name: '',
        state: 'Delaware',
        ein: '',
        address: '',
        registeredAgent: '',
      })
      setIsSaving(false)
    }
  }, [open])

  const handleNext = () => {
    if (step === 'type') {
      setStep('structure')
    } else if (step === 'structure') {
      setStep('details')
    }
  }

  const handleBack = () => {
    if (step === 'structure') {
      setStep('type')
    } else if (step === 'details') {
      setStep('structure')
    }
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
    if (step === 'structure') {
      if (structure === 'series') return !!masterEntityId
      return true
    }
    if (step === 'details') {
      return formData.name.trim() && formData.state && formData.address.trim()
    }
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
                {i < ['type', 'structure', 'details'].indexOf(step) ? (
                  <Check className="size-3" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div className={cn(
                  "flex-1 h-0.5 transition-colors",
                  i < ['type', 'structure', 'details'].indexOf(step) 
                    ? "bg-primary/20" 
                    : "bg-muted"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Entity Type */}
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-2"
            >
              <RadioGroup
                value={entityType}
                onValueChange={(v) => setEntityType(v as EntityType)}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="llc"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all",
                    entityType === 'llc' 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-muted-foreground/30"
                  )}
                >
                  <RadioGroupItem value="llc" id="llc" className="sr-only" />
                  <Building2 className={cn(
                    "size-8 mb-2",
                    entityType === 'llc' ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-medium text-sm",
                    entityType === 'llc' ? "text-primary" : "text-foreground"
                  )}>LLC</span>
                  <span className="text-[10px] text-muted-foreground text-center mt-1">
                    Limited Liability Company
                  </span>
                </Label>
                
                <Label
                  htmlFor="lp"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all",
                    entityType === 'lp' 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-muted-foreground/30"
                  )}
                >
                  <RadioGroupItem value="lp" id="lp" className="sr-only" />
                  <Users className={cn(
                    "size-8 mb-2",
                    entityType === 'lp' ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-medium text-sm",
                    entityType === 'lp' ? "text-primary" : "text-foreground"
                  )}>LP</span>
                  <span className="text-[10px] text-muted-foreground text-center mt-1">
                    Limited Partnership
                  </span>
                </Label>
              </RadioGroup>
            </motion.div>
          )}

          {/* Step 2: Structure */}
          {step === 'structure' && (
            <motion.div
              key="structure"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-2"
            >
              <RadioGroup
                value={structure}
                onValueChange={(v) => setStructure(v as EntityStructure)}
                className="space-y-3"
              >
                <Label
                  htmlFor="independent"
                  className={cn(
                    "flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
                    structure === 'independent' 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-muted-foreground/30"
                  )}
                >
                  <RadioGroupItem value="independent" id="independent" className="mt-0.5" />
                  <div className="flex-1">
                    <span className={cn(
                      "font-medium text-sm block",
                      structure === 'independent' ? "text-primary" : "text-foreground"
                    )}>Independent Entity</span>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      A standalone legal entity with its own EIN and operating agreement.
                    </span>
                  </div>
                </Label>
                
                <Label
                  htmlFor="series"
                  className={cn(
                    "flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
                    structure === 'series' 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-muted-foreground/30"
                  )}
                >
                  <RadioGroupItem value="series" id="series" className="mt-0.5" />
                  <div className="flex-1">
                    <span className={cn(
                      "font-medium text-sm block",
                      structure === 'series' ? "text-primary" : "text-foreground"
                    )}>Series under Master</span>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      A series entity under an existing master LLC. Shares the master's EIN.
                    </span>
                  </div>
                </Label>
              </RadioGroup>

              {/* Master Entity Selection */}
              {structure === 'series' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <Label className="text-xs font-medium">Select Master Entity</Label>
                  <Select value={masterEntityId} onValueChange={setMasterEntityId}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Choose a master entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {MASTER_ENTITIES.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">
                    The series will inherit the master entity's operating agreement.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-2"
            >
              <div className="space-y-2">
                <Label htmlFor="entity-name" className="text-xs font-medium">
                  Entity Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="entity-name"
                  placeholder={entityType === 'llc' ? "e.g., Acme Ventures LLC" : "e.g., Acme Partners LP"}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-xs font-medium">
                    State of Formation <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.state} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, state: v }))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ein" className="text-xs font-medium">
                    EIN {structure === 'series' && '(uses master)'}
                  </Label>
                  <Input
                    id="ein"
                    placeholder="XX-XXXXXXX"
                    value={formData.ein}
                    onChange={(e) => setFormData(prev => ({ ...prev, ein: e.target.value }))}
                    className="h-10"
                    disabled={structure === 'series'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-medium">
                  Principal Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="123 Main Street, Suite 100&#10;City, State ZIP"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registered-agent" className="text-xs font-medium">
                  Registered Agent
                </Label>
                <Input
                  id="registered-agent"
                  placeholder="e.g., Corporation Service Company"
                  value={formData.registeredAgent}
                  onChange={(e) => setFormData(prev => ({ ...prev, registeredAgent: e.target.value }))}
                  className="h-10"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="gap-2 sm:gap-0">
          {step !== 'type' ? (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          
          {step !== 'details' ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Continue
              <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={!canProceed() || isSaving}>
              {isSaving ? 'Saving...' : 'Add Entity'}
            </Button>
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

  const canSave = formData.legalName.trim() && formData.location

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Asset</DialogTitle>
          <DialogDescription>
            Add the underlying asset details for this deal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="asset-name" className="text-xs font-medium">
              Legal Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="asset-name"
              placeholder="e.g., Acme Corporation"
              value={formData.legalName}
              onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Asset Type <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as AssetType }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="spv_into_fund">SPV into Fund</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Security Type <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={formData.securityType} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, securityType: v as SecurityType }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-xs font-medium">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g., Artificial Intelligence"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs font-medium">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g., United States"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="total-shares" className="text-xs font-medium">Total Shares</Label>
              <Input
                id="total-shares"
                type="number"
                placeholder="e.g., 100000"
                value={formData.totalShares}
                onChange={(e) => setFormData(prev => ({ ...prev, totalShares: e.target.value }))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-price" className="text-xs font-medium">Share Price ($)</Label>
              <Input
                id="share-price"
                type="number"
                step="0.01"
                placeholder="e.g., 10.00"
                value={formData.sharePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, sharePrice: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving ? 'Saving...' : 'Add Asset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ EDIT DEAL DIALOG ============

interface EditDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal
  onSave: (updates: Partial<Deal>) => void
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
      setIsSaving(false)
    }
  }, [open, deal])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onSave({
      name: formData.name,
      memo: formData.memo || undefined,
      targetRaise: parseFloat(formData.targetRaise) || deal.targetRaise,
      minimumInvestment: parseFloat(formData.minimumInvestment) || deal.minimumInvestment,
      managementFee: parseFloat(formData.managementFee) || 0,
      carry: parseFloat(formData.carry) || 0,
    })
    
    onOpenChange(false)
  }

  const canSave = formData.name.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>
            Update the deal details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="deal-name" className="text-xs font-medium">
              Deal Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="deal-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo" className="text-xs font-medium">Description</Label>
            <Textarea
              id="memo"
              placeholder="Brief description of the investment opportunity..."
              value={formData.memo}
              onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
              className="min-h-[80px] resize-none"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="target-raise" className="text-xs font-medium">Target Raise ($)</Label>
              <Input
                id="target-raise"
                type="number"
                value={formData.targetRaise}
                onChange={(e) => setFormData(prev => ({ ...prev, targetRaise: e.target.value }))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-investment" className="text-xs font-medium">Minimum Investment ($)</Label>
              <Input
                id="min-investment"
                type="number"
                value={formData.minimumInvestment}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumInvestment: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mgmt-fee" className="text-xs font-medium">Management Fee (%)</Label>
              <Input
                id="mgmt-fee"
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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ MAIN PAGE ============

interface DealAdminPageProps {
  deal: Deal
}

export function DealAdminPage({ deal: initialDeal }: DealAdminPageProps) {
  const router = useRouter()
  const [deal, setDeal] = React.useState(initialDeal)
  const [entity, setEntity] = React.useState<Partial<Entity> | null>(null)
  const [assets, setAssets] = React.useState<Partial<Asset>[]>([])
  
  const [editDealOpen, setEditDealOpen] = React.useState(false)
  const [addEntityOpen, setAddEntityOpen] = React.useState(false)
  const [addAssetOpen, setAddAssetOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleUpdateDeal = async (updates: Partial<Deal>) => {
    setDeal(prev => ({ ...prev, ...updates }))
    try {
      if (!deal.id.startsWith('deal_')) {
        await updateDeal(deal.id, updates)
      }
    } catch (e) {
      console.error('Failed to save updates', e)
    }
  }

  const handleAddEntity = (newEntity: Partial<Entity>) => {
    setEntity(newEntity)
    if (newEntity.name) {
      handleUpdateDeal({ entityName: newEntity.name })
    }
  }

  const handleAddAsset = (newAsset: Partial<Asset>) => {
    setAssets(prev => [...prev, { ...newAsset, id: `asset_${Date.now()}` }])
  }

  const handleRemoveAsset = (index: number) => {
    setAssets(prev => prev.filter((_, i) => i !== index))
  }

  const canSubmitForReview = !!entity && assets.length > 0 && deal.status === 'draft'

  const handleSubmitForReview = async () => {
    if (!canSubmitForReview) return
    setIsSubmitting(true)
    try {
      if (!deal.id.startsWith('deal_')) {
        const res = await updateDeal(deal.id, { status: 'submitted' })
        if (res) {
          setDeal(prev => ({ ...prev, status: 'submitted' }))
          router.push('/deals')
        } else {
          console.error('Failed to submit deal')
        }
      } else {
        setDeal(prev => ({ ...prev, status: 'submitted' }))
        router.push('/deals')
      }
    } catch (e) {
      console.error('Submit error:', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link 
        href="/deals" 
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Deals
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
      >
        <div className="flex items-start gap-3">
          <Avatar className="size-12 rounded-lg bg-primary/10 text-primary shrink-0">
            <AvatarFallback className="text-lg font-semibold rounded-lg bg-transparent">
              {deal.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge(deal.status)}
              <Badge variant="outline" className="uppercase text-[10px]">
                {deal.type}
              </Badge>
            </div>
            <h1 className="text-xl font-semibold">{deal.name}</h1>
            <p className="text-sm text-muted-foreground">{deal.entityName || 'No entity assigned'}</p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => setEditDealOpen(true)}>
          <Edit2 className="size-3.5 mr-1.5" />
          Edit Deal
        </Button>
      </motion.div>

      {/* Alert for missing requirements */}
      {!canSubmitForReview && (
        <Alert className="border-warning/30 bg-warning/5">
          <AlertCircle className="size-4 text-warning" />
          <AlertDescription className="text-sm">
            <span className="font-medium">Missing requirements:</span>
            {!entity && ' Add an entity (required for registry).'}
            {assets.length === 0 && ' Add at least one asset.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Entity Section */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="size-4 text-muted-foreground" />
                  Entity
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  One entity required for registry
                </CardDescription>
              </div>
              {!entity && (
                <Button size="sm" variant="outline" onClick={() => setAddEntityOpen(true)}>
                  <Plus className="size-3.5 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {entity ? (
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{entity.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entity.type?.toUpperCase()} - {entity.state}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {entity.structure === 'series' ? 'Series' : 'Independent'}
                  </Badge>
                </div>
                {entity.structure === 'series' && entity.masterEntityName && (
                  <p className="text-xs text-muted-foreground">
                    Master: {entity.masterEntityName}
                  </p>
                )}
                {entity.address && (
                  <p className="text-xs text-muted-foreground">{entity.address}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddEntityOpen(true)}>
                    <Edit2 className="size-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => setEntity(null)}
                  >
                    <Trash2 className="size-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Building2 className="size-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No entity added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assets Section */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="size-4 text-muted-foreground" />
                  Assets
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {assets.length} asset{assets.length !== 1 ? 's' : ''} added
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setAddAssetOpen(true)}>
                <Plus className="size-3.5 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {assets.length > 0 ? (
              <div className="space-y-2">
                {assets.map((asset, index) => (
                  <div key={asset.id || index} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{asset.legalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {asset.type?.replace('_', ' ')} - {asset.securityType?.replace('_', ' ')}
                        </p>
                        {asset.industry && (
                          <p className="text-xs text-muted-foreground">{asset.industry}</p>
                        )}
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="size-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveAsset(index)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                    {(asset.totalShares || asset.sharePrice) && (
                      <div className="flex gap-4 mt-2 text-xs">
                        {asset.totalShares && (
                          <span className="text-muted-foreground">
                            Shares: {asset.totalShares.toLocaleString()}
                          </span>
                        )}
                        {asset.sharePrice && (
                          <span className="text-muted-foreground">
                            Price: ${asset.sharePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="size-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No assets added yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deal Summary */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="size-4 text-muted-foreground" />
            Deal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Target Raise</p>
              <p className="font-semibold">{formatCurrency(deal.targetRaise)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Minimum</p>
              <p className="font-semibold">{formatCurrency(deal.minimumInvestment)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Mgmt Fee</p>
              <p className="font-semibold">{deal.managementFee}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Carry</p>
              <p className="font-semibold">{deal.carry}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memo */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              Memo
            </CardTitle>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditDealOpen(true)}>
              <Edit2 className="size-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">{deal.memo || 'No memo added yet'}</p>
        </CardContent>
      </Card>

      {/* Submit for Review */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href={`/deals/${deal.id}`}>
            <ExternalLink className="size-4 mr-1.5" />
            Preview Deal
          </Link>
        </Button>
        <Button disabled={!canSubmitForReview || isSubmitting} onClick={handleSubmitForReview}>
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          {!isSubmitting && <ChevronRight className="size-4 ml-1" />}
        </Button>
      </div>

      {/* Dialogs */}
      <EditDealDialog 
        open={editDealOpen} 
        onOpenChange={setEditDealOpen} 
        deal={deal}
        onSave={handleUpdateDeal}
      />
      <AddEntityDialog 
        open={addEntityOpen} 
        onOpenChange={setAddEntityOpen}
        onSave={handleAddEntity}
      />
      <AddAssetDialog 
        open={addAssetOpen} 
        onOpenChange={setAddAssetOpen}
        onSave={handleAddAsset}
      />
    </div>
  )
}
