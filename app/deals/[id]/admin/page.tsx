import { notFound } from 'next/navigation'
import { DealAdminPage } from '@/components/pages/deal-admin-page'


interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  
  let deal = null
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api'
    const res = await fetch(`${baseUrl}/deals/${id}`, { cache: 'no-store' })
    if (res.ok) {
      deal = await res.json()
    }
  } catch (e) {
    console.error('Failed to fetch deal from backend', e)
  }

  // For new deals generated from client if any
  if (!deal && id.startsWith('deal_')) {
    const newDeal = {
      id,
      name: 'New Deal',
      entityName: '',
      status: 'draft' as const,
      type: 'spv' as const,
      productType: 'standard_spv' as const,
      managementFee: 2,
      carry: 20,
      targetRaise: 1000000,
      minimumInvestment: 25000,
      totalSigned: 0,
      totalWired: 0,
      investorCount: 0,
      estimatedClosingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      offeringType: '506b' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fundManagerId: 'user_1',
    }
    
    return <DealAdminPage deal={newDeal} />
  }
  
  if (!deal) {
    notFound()
  }
  
  return <DealAdminPage deal={deal} />
}
