"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { FundManagerPage } from "@/components/pages/fund-manager-page"

export default function FundManagerRoute() {
  return (
    <AppLayout>
      <FundManagerPage />
    </AppLayout>
  )
}
