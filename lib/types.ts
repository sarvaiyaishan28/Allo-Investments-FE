// User Types
export type UserRole = 'investor' | 'fund_manager' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  walletAddress?: string
  createdAt: string
}

// Deal Types
export type DealStatus = 'draft' | 'submitted' | 'onboarding' | 'closing' | 'close_requested' | 'closed' | 'test' | 'migration'
export type DealType = 'spv' | 'fund'
export type ProductType = 'standard_spv' | 'premium_spv' | 'fund'
export type OfferingType = '506b' | '506c' | 'reg_d' | 'reg_s'

export interface Deal {
  id: string
  name: string
  entityName: string
  status: DealStatus
  type: DealType
  productType: ProductType
  managementFee: number
  carry: number
  targetRaise: number
  minimumInvestment: number
  totalSigned: number
  totalWired: number
  investorCount: number
  estimatedClosingDate: string
  offeringType: OfferingType
  memo?: string
  pitchDeckUrl?: string
  createdAt: string
  updatedAt: string
  fundManagerId: string
  assetId?: string
}

// Investment Types
export type InvestmentStatus = 'invited' | 'viewed' | 'completed' | 'signed' | 'committed' | 'wired' | 'complete' | 'declined'
export type KYCStatus = 'not_run' | 'pending' | 'approved' | 'needs_review' | 'rejected'
export type InvestorType = 'individual' | 'entity'

export interface Investment {
  id: string
  dealId: string
  dealName: string
  investorId: string
  investorName: string
  investorEmail: string
  investorType: InvestorType
  status: InvestmentStatus
  kycStatus: KYCStatus
  subscriptionAmount: number
  capitalWired: number
  managementFee: number
  carry: number
  txHash?: string
  chain?: string
  createdAt: string
  signedAt?: string
}

// Asset Types
export type AssetType = 'startup' | 'spv_into_fund' | 'secondary' | 'real_estate'
export type SecurityType = 'preferred_stock' | 'common_stock' | 'convertible_note' | 'safe' | 'secondary'

export interface Asset {
  id: string
  legalName: string
  type: AssetType
  industry?: string
  location: string
  securityType: SecurityType
  totalShares?: number
  sharePrice?: number
  filesCount: number
  createdAt: string
}

// Entity Types
export type EntityType = 'llc' | 'lp'
export type EntityStructure = 'independent' | 'series'

export interface Entity {
  id: string
  name: string
  type: EntityType
  structure: EntityStructure
  masterEntityId?: string // Only for series entities
  masterEntityName?: string
  state: string
  ein?: string
  address: string
  registeredAgent?: string
  formationDate?: string
  createdAt: string
}

// Identity Types
export type IdentityType = 'individual' | 'entity'
export type AccreditationStatus = 'pending' | 'verified' | 'expired' | 'not_verified'

export interface Identity {
  id: string
  name: string
  type: IdentityType
  email: string
  phone?: string
  accreditationStatus: AccreditationStatus
  kycStatus: KYCStatus
  createdAt: string
}

// News Types
export interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string
  source: string
  sourceIcon?: string
  imageUrl?: string
  publishedAt: string
  category: string
  relatedCompanies: string[]
  featured?: boolean
}

// File Types
export interface FileItem {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
  uploadedBy: string
}

// Ledger Types
export type LedgerEntryType = 'capital_call' | 'distribution' | 'management_fee' | 'carried_interest' | 'expense' | 'adjustment'
export type LedgerEntryStatus = 'pending' | 'completed' | 'failed'

export interface LedgerEntry {
  id: string
  dealId: string
  dealName: string
  type: LedgerEntryType
  description: string
  amount: number
  status: LedgerEntryStatus
  date: string
  createdAt: string
}

// Fee Types
export type FeeType = 'management_fee' | 'performance_fee' | 'formation_fee' | 'administrative_fee' | 'other'
export type FeeStatus = 'pending' | 'paid' | 'waived' | 'overdue'

export interface Fee {
  id: string
  dealId: string
  dealName: string
  type: FeeType
  description: string
  amount: number
  status: FeeStatus
  dueDate: string
  paidDate?: string
  createdAt: string
}

// Notification Types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  actionUrl?: string
}

// Stats Types
export interface DashboardStats {
  totalInvestments: number
  totalValue: number
  activeDeals: number
  pendingActions: number
}

export interface FundManagerStats {
  assetsUnderManagement: number
  totalInvestors: number
  totalDeals: number
  activeDeals: number
}
