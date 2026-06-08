'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Briefcase,
  TrendingUp,
  Building2,
  Users,
  Shield,
  BookOpen,
  Receipt,
  FolderOpen,
  Newspaper,
  Settings,
  HelpCircle,
  Calendar,
  ChevronDown,
  LogOut,
  User,
  Moon,
  Sun,
  Wallet,
  Menu,
  Bell,
  Search,
  PanelLeftClose,
  PanelLeft,
  Command,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWallet } from '@/components/providers/wallet-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { fetchNotifications } from '@/lib/api-client'
import type { Notification } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlloLogo } from '@/components/ui/allo-logo'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { toast } from 'sonner'

// Navigation items
const mainNavItems = [
  { title: 'Dashboard', href: '/', icon: Home },
  { title: 'Deals', href: '/deals', icon: Briefcase },
  { title: 'Investments', href: '/investments', icon: TrendingUp },
  { title: 'Assets', href: '/assets', icon: Building2 },
  { title: 'Entities', href: '/entities', icon: Users },
  { title: 'Identities', href: '/identities', icon: Shield },
]

const financeNavItems = [
  { title: 'Ledger', href: '/ledger', icon: BookOpen },
  { title: 'Fees', href: '/fees', icon: Receipt },
  { title: 'Documents', href: '/documents', icon: FolderOpen },
]

const discoverNavItems = [
  { title: 'News', href: '/news', icon: Newspaper },
  { title: 'Community', href: '/community', icon: Users },
]

const supportNavItems = [
  { title: 'Schedule', href: '/schedule', icon: Calendar },
  { title: 'Settings', href: '/settings', icon: Settings },
  { title: 'Help', href: '/help', icon: HelpCircle },
]

function NavLink({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: { title: string; href: string; icon: React.ElementType }
  isActive: boolean
  collapsed: boolean
  onClick?: () => void
}) {
  const content = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
        collapsed && 'justify-center px-2',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
    >
      <item.icon className="size-4 shrink-0" />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.title}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

function DesktopSidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()

  const visibleMainNav = mainNavItems.filter(item =>
    isAuthenticated || ['/', '/deals'].includes(item.href)
  )
  const visibleFinanceNav = isAuthenticated ? financeNavItems : []
  const visibleSupportNav = isAuthenticated ? supportNavItems.slice(0, 2) : []

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 border-r bg-card transition-all duration-200',
          collapsed ? 'w-[68px]' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-14 border-b px-4',
          collapsed && 'justify-center px-2'
        )}>
          <Link href="/" className="flex items-center gap-2.5">
            <AlloLogo size="md" collapsed={collapsed} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Portfolio
              </p>
            )}
            {visibleMainNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                collapsed={collapsed}
              />
            ))}
          </div>

          {visibleFinanceNav.length > 0 && (
            <div className="space-y-1">
              {!collapsed && (
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Finance
                </p>
              )}
              {visibleFinanceNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href || pathname.startsWith(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          )}

          <div className="space-y-1">
            {!collapsed && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Discover
              </p>
            )}
            {discoverNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t py-3 px-3 space-y-1">
          {visibleSupportNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              collapsed={collapsed}
            />
          ))}

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm w-full transition-colors',
              'text-muted-foreground hover:bg-secondary hover:text-foreground',
              collapsed && 'justify-center px-2'
            )}
          >
            {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User Profile */}
        <div className="border-t p-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2 py-2 w-full transition-colors hover:bg-secondary',
                    collapsed && 'justify-center'
                  )}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={collapsed ? "center" : "end"} side="top" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-xs">
                  <Link href="/settings?tab=profile">
                    <User className="size-3.5 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-xs">
                  <Link href="/settings">
                    <Settings className="size-3.5 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs cursor-pointer" onClick={logout}>
                  <LogOut className="size-3.5 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-start")}>
              <Link href="/login" className="w-full">
                <Button variant="outline" className={cn("w-full h-10 gap-2", collapsed && "w-10 px-0")}>
                  <LogOut className={cn("size-4", !collapsed && "rotate-180")} />
                  {!collapsed && "Sign In"}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}

function TopHeader() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = React.useState<Notification[]>([])

  React.useEffect(() => {
    fetchNotifications().then(setNotifications).catch(console.error)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-50 hidden lg:flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-6">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search deals, investors..."
            className="h-9 pl-9 pr-12 bg-secondary/50 border-0 focus-visible:bg-background focus-visible:ring-1"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
            <Command className="size-3" />K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-8">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">{unreadCount} new</Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 4).map((notif) => (
              <DropdownMenuItem key={notif.id} className="flex-col items-start gap-1 py-2.5">
                <p className="text-sm font-medium">{notif.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-xs text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Wallet */}
        <CustomConnectButton />
      </div>
    </header>
  )
}

function MobileHeader() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = React.useState(false)

  const visibleMainNav = mainNavItems.filter(item =>
    isAuthenticated || ['/', '/deals'].includes(item.href)
  )
  const visibleFinanceNav = isAuthenticated ? financeNavItems : []
  const visibleSupportNav = isAuthenticated ? supportNavItems.slice(0, 2) : []

  return (
    <header className="sticky top-0 z-50 flex lg:hidden h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="size-9">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 h-14 border-b px-4">
              <AlloLogo size="md" />
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  Portfolio
                </p>
                {visibleMainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.title}
                  </Link>
                ))}
              </div>

              {visibleFinanceNav.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                    Finance
                  </p>
                  {visibleFinanceNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        pathname === item.href || pathname.startsWith(item.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  Discover
                </p>
                {discoverNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      pathname === item.href || pathname.startsWith(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="border-t p-4 space-y-4">
              {visibleSupportNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <item.icon className="size-4" />
                  {item.title}
                </Link>
              ))}

              {isAuthenticated ? (
                <div className="flex items-center gap-3 px-3 py-2.5 pt-3 border-t">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t">
                  <Button variant="outline" className="w-full h-10" onClick={() => document.getElementById('login-btn')?.click()}>
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Link href="/" className="flex items-center gap-2">
        <AlloLogo size="sm" />
      </Link>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-9">
          <Search className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-9">
          <Bell className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <CustomConnectButton />
      </div>
    </header>
  )
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { user, logout, isAuthenticated, isLoading, requireAuth } = useAuth()
  const [collapsed, setCollapsed] = React.useState(false)

  // Route Protection Guard
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const protectedRoutes = ['/investments', '/assets', '/entities', '/identities', '/ledger', '/fees', '/documents', '/settings']
      if (protectedRoutes.some(route => pathname.startsWith(route))) {
        requireAuth()
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
    }
  }, [pathname, isAuthenticated, isLoading, requireAuth])

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <TopHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button 
                    onClick={openConnectModal} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 h-9 gap-2 rounded-lg"
                  >
                    <Wallet className="size-4" />
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button 
                    onClick={openChainModal} 
                    variant="destructive" 
                    className="h-9 gap-2 rounded-lg font-semibold"
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    variant="secondary"
                    className="h-9 gap-2 rounded-lg font-semibold hidden sm:flex px-3"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                  </Button>

                  <Button 
                    onClick={openAccountModal} 
                    variant="secondary" 
                    className="h-9 gap-2 rounded-lg font-semibold px-3"
                  >
                    <Avatar className="size-5">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {account.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{account.displayName}</span>
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
