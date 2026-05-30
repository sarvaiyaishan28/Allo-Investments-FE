'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiFetch } from '@/lib/api-client'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  requireAuth: (redirectPath?: string) => boolean
  showLoginRequired: boolean
  setShowLoginRequired: (show: boolean) => void
  redirectPath: string | null
  setRedirectPath: (path: string | null) => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [showLoginRequired, setShowLoginRequired] = React.useState(false)
  const [redirectPath, setRedirectPath] = React.useState<string | null>(null)

  // Check for existing session on mount
  React.useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Fetch extended user profile from backend
        try {
          const profile = await apiFetch('/users/me')
          if (profile) setUser(profile)
        } catch (e) {
          console.error('Failed to fetch user profile:', e)
        }
      }
      setIsLoading(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          let profile = await apiFetch('/users/me').catch(() => null)
          
          if (!profile) {
            try {
              const name = session.user.user_metadata?.name || 'Unknown'
              await apiFetch('/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, role: 'investor' })
              })
              profile = await apiFetch('/users/me').catch(() => null)
            } catch (createError) {
              console.error('Failed to create user profile during onAuthStateChange:', createError)
            }
          }
          
          if (profile) setUser(profile)
        } catch (e) {
          console.error('Failed to fetch user profile:', e)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name } // Store name in user metadata for later profile creation
        }
      })
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Signup failed:', error.message)
      return { success: false, error: error.message }
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      
      if (data.session?.user) {
        // Fetch profile
        let profile = await apiFetch('/users/me').catch(() => null)
        
        // Profile doesn't exist yet! We must create it.
        // This happens on the very first login after email verification.
        if (!profile) {
          try {
            const name = data.session.user.user_metadata?.name || 'Unknown'
            await apiFetch('/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, role: 'investor' })
            })
            profile = await apiFetch('/users/me').catch(() => null)
          } catch (createError) {
            console.error('Failed to create user profile during first login:', createError)
          }
        }

        if (profile) {
          setUser(profile)
          return true
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error.message)
    }
    return false
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  const requireAuth = (customRedirectPath?: string): boolean => {
    if (user) return true
    
    // Set the redirect path to current page or custom path
    setRedirectPath(customRedirectPath || pathname)
    setShowLoginRequired(true)
    return false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        requireAuth,
        showLoginRequired,
        setShowLoginRequired,
        redirectPath,
        setRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
