import { notFound } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DealPageWrapper } from '@/components/pages/deal-page-wrapper'


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

  if (!deal) {
    notFound()
  }

  return (
    <AppLayout>
      <DealPageWrapper deal={deal} />
    </AppLayout>
  )
}
