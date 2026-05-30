'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Lock } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'

export function LoginRequiredDialog() {
  const router = useRouter()
  const { showLoginRequired, setShowLoginRequired, redirectPath } = useAuth()

  const handleLogin = () => {
    setShowLoginRequired(false)
    // Pass redirect path as query param
    const loginUrl = redirectPath 
      ? `/login?redirect=${encodeURIComponent(redirectPath)}`
      : '/login'
    router.push(loginUrl)
  }

  const handleClose = () => {
    setShowLoginRequired(false)
  }

  return (
    <Dialog open={showLoginRequired} onOpenChange={setShowLoginRequired}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">Login Required</DialogTitle>
          <DialogDescription className="text-center">
            You need to be logged in to perform this action. Please sign in to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleLogin} className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Sign in to continue
          </Button>
          <Button variant="outline" onClick={handleClose} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
