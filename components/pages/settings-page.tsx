'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Save,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Key,
  LogOut,
  Trash2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface SettingsSection {
  id: string
  label: string
  icon: React.ElementType
  description: string
}

const settingsSections: SettingsSection[] = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal information' },
  { id: 'organization', label: 'Organization', icon: Building2, description: 'Company and team settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure alert preferences' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password and authentication' },
  { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Subscription and payments' },
  { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display settings' },
]

export function SettingsPage() {
  const [activeSection, setActiveSection] = React.useState('profile')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  // Form states
  const [profile, setProfile] = React.useState({
    firstName: 'Alex',
    lastName: 'Martinez',
    email: 'alex@allo.com',
    phone: '+1 (555) 123-4567',
    title: 'Managing Partner',
    bio: 'Experienced fund manager with 10+ years in private equity.',
  })

  const [notifications, setNotifications] = React.useState({
    emailDeals: true,
    emailInvestments: true,
    emailDocuments: false,
    pushDeals: true,
    pushInvestments: false,
    pushDocuments: true,
    weeklyDigest: true,
    marketingEmails: false,
  })

  const [appearance, setAppearance] = React.useState({
    theme: 'system',
    compactMode: false,
    sidebarCollapsed: false,
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={handleSave} disabled={isSaving}>
            <Save className="size-3.5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64 shrink-0"
          >
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {settingsSections.map((section) => {
                    const Icon = section.icon
                    const isActive = activeSection === section.id
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{section.label}</p>
                        </div>
                        <ChevronRight className={cn("size-4 shrink-0 transition-transform", isActive && "rotate-90")} />
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            {/* Profile Settings */}
            {activeSection === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Profile Information</CardTitle>
                  <CardDescription>Update your personal details and public profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-2xl">
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Camera className="size-3.5" />
                        Change Photo
                      </Button>
                      <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="h-9 text-sm pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="h-9 text-sm pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs">Job Title</Label>
                    <Input
                      id="title"
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-xs">Bio</Label>
                    <textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organization Settings */}
            {activeSection === 'organization' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Organization Settings</CardTitle>
                  <CardDescription>Manage your company information and team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="orgName" className="text-xs">Organization Name</Label>
                      <Input id="orgName" defaultValue="Oakwood Capital LP" className="h-9 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgType" className="text-xs">Organization Type</Label>
                      <Select defaultValue="fund">
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fund">Fund Manager</SelectItem>
                          <SelectItem value="investor">Investor</SelectItem>
                          <SelectItem value="advisor">Advisor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs">Business Address</Label>
                    <Input id="address" defaultValue="123 Financial District, New York, NY 10004" className="h-9 text-sm" />
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Team Members</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Alex Martinez', email: 'alex@allo.com', role: 'Admin' },
                        { name: 'Sarah Mitchell', email: 'sarah@allo.com', role: 'Member' },
                        { name: 'Marcus Johnson', email: 'marcus@allo.com', role: 'Member' },
                      ].map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-[10px] text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{member.role}</Badge>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 text-xs">
                      Invite Team Member
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Email Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Deal Updates</p>
                          <p className="text-[10px] text-muted-foreground">Receive emails about deal status changes</p>
                        </div>
                        <Switch
                          checked={notifications.emailDeals}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, emailDeals: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Investment Activity</p>
                          <p className="text-[10px] text-muted-foreground">Get notified about new investments</p>
                        </div>
                        <Switch
                          checked={notifications.emailInvestments}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, emailInvestments: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Document Uploads</p>
                          <p className="text-[10px] text-muted-foreground">Email when new documents are added</p>
                        </div>
                        <Switch
                          checked={notifications.emailDocuments}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, emailDocuments: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Push Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Deal Alerts</p>
                          <p className="text-[10px] text-muted-foreground">Push notifications for urgent deal updates</p>
                        </div>
                        <Switch
                          checked={notifications.pushDeals}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, pushDeals: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Investment Confirmations</p>
                          <p className="text-[10px] text-muted-foreground">Instant alerts when investments are confirmed</p>
                        </div>
                        <Switch
                          checked={notifications.pushInvestments}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, pushInvestments: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Digests & Marketing</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Weekly Digest</p>
                          <p className="text-[10px] text-muted-foreground">Summary of activity every Monday</p>
                        </div>
                        <Switch
                          checked={notifications.weeklyDigest}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Marketing Emails</p>
                          <p className="text-[10px] text-muted-foreground">Product updates and announcements</p>
                        </div>
                        <Switch
                          checked={notifications.marketingEmails}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, marketingEmails: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Security Settings</CardTitle>
                  <CardDescription>Manage your password and authentication methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Change Password</h4>
                    <div className="space-y-3 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            className="h-9 text-sm pl-9 pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                        <Input id="newPassword" type="password" className="h-9 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-xs">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" className="h-9 text-sm" />
                      </div>
                      <Button size="sm" className="text-xs">Update Password</Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Shield className="size-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">2FA is enabled</p>
                          <p className="text-[10px] text-muted-foreground">Your account is protected with authenticator app</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs">Manage</Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Active Sessions</h4>
                    <div className="space-y-2">
                      {[
                        { device: 'MacBook Pro', location: 'New York, US', current: true },
                        { device: 'iPhone 15', location: 'New York, US', current: false },
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                              {session.device.includes('iPhone') ? <Smartphone className="size-4" /> : <Monitor className="size-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium flex items-center gap-2">
                                {session.device}
                                {session.current && <Badge variant="secondary" className="text-[9px] h-4">Current</Badge>}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{session.location}</p>
                            </div>
                          </div>
                          {!session.current && (
                            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive">
                              <LogOut className="size-3.5 mr-1" />
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Settings */}
            {activeSection === 'billing' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Billing & Subscription</CardTitle>
                  <CardDescription>Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="mb-2">Pro Plan</Badge>
                        <p className="text-2xl font-bold">$99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <p className="text-xs text-muted-foreground mt-1">Next billing date: February 15, 2024</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs">Change Plan</Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Payment Method</h4>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                          <CreditCard className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Visa ending in 4242</p>
                          <p className="text-[10px] text-muted-foreground">Expires 12/2025</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs">Update</Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Billing History</h4>
                    <div className="space-y-2">
                      {[
                        { date: 'Jan 15, 2024', amount: '$99.00', status: 'Paid' },
                        { date: 'Dec 15, 2023', amount: '$99.00', status: 'Paid' },
                        { date: 'Nov 15, 2023', amount: '$99.00', status: 'Paid' },
                      ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div>
                            <p className="text-sm font-medium">{invoice.date}</p>
                            <p className="text-[10px] text-muted-foreground">{invoice.amount}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">{invoice.status}</Badge>
                            <Button variant="ghost" size="sm" className="text-xs">Download</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Appearance Settings</CardTitle>
                  <CardDescription>Customize how the app looks and feels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Theme</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'dark', label: 'Dark', icon: Moon },
                        { id: 'system', label: 'System', icon: Monitor },
                      ].map((theme) => {
                        const Icon = theme.icon
                        const isSelected = appearance.theme === theme.id
                        return (
                          <button
                            key={theme.id}
                            onClick={() => setAppearance({ ...appearance, theme: theme.id })}
                            className={cn(
                              "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                              isSelected 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <Icon className={cn("size-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("text-xs font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>
                              {theme.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Display Options</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Compact Mode</p>
                          <p className="text-[10px] text-muted-foreground">Reduce spacing and padding</p>
                        </div>
                        <Switch
                          checked={appearance.compactMode}
                          onCheckedChange={(checked) => setAppearance({ ...appearance, compactMode: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Collapsed Sidebar</p>
                          <p className="text-[10px] text-muted-foreground">Start with sidebar collapsed by default</p>
                        </div>
                        <Switch
                          checked={appearance.sidebarCollapsed}
                          onCheckedChange={(checked) => setAppearance({ ...appearance, sidebarCollapsed: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Language & Region</h4>
                    <div className="grid gap-4 sm:grid-cols-2 max-w-md">
                      <div className="space-y-2">
                        <Label className="text-xs">Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Timezone</Label>
                        <Select defaultValue="est">
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="est">Eastern Time (ET)</SelectItem>
                            <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                            <SelectItem value="utc">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  )
}
