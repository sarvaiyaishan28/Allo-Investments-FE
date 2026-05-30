'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  Bell,
  MoreHorizontal,
  Filter,
  Search,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Event {
  id: string
  title: string
  date: Date
  startTime: string
  endTime: string
  type: 'meeting' | 'deadline' | 'call' | 'reminder'
  location?: string
  attendees?: string[]
  description?: string
}

const events: Event[] = []

const eventTypeConfig = {
  meeting: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Users },
  deadline: { color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: Bell },
  call: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Video },
  reminder: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
}

export function SchedulePage() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState(new Date())
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad with days from previous/next month for full weeks
  const startDayOfWeek = monthStart.getDay()
  const endDayOfWeek = monthEnd.getDay()
  
  const prevMonthDays = startDayOfWeek > 0 
    ? eachDayOfInterval({
        start: new Date(monthStart.getTime() - startDayOfWeek * 24 * 60 * 60 * 1000),
        end: new Date(monthStart.getTime() - 24 * 60 * 60 * 1000)
      })
    : []
  
  const nextMonthDays = endDayOfWeek < 6
    ? eachDayOfInterval({
        start: new Date(monthEnd.getTime() + 24 * 60 * 60 * 1000),
        end: new Date(monthEnd.getTime() + (6 - endDayOfWeek) * 24 * 60 * 60 * 1000)
      })
    : []

  const allDays = [...prevMonthDays, ...monthDays, ...nextMonthDays]

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date))
  }

  const selectedDateEvents = getEventsForDate(selectedDate)

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  const stats = {
    totalEvents: events.length,
    thisMonth: events.filter(e => isSameMonth(e.date, currentMonth)).length,
    meetings: events.filter(e => e.type === 'meeting').length,
    deadlines: events.filter(e => e.type === 'deadline').length,
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Schedule</h1>
            <p className="text-sm text-muted-foreground">Manage your meetings, deadlines, and events</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 gap-1.5 text-xs">
                <Plus className="size-3.5" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>Add a new event to your schedule</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" placeholder="Enter event title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" type="time" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" type="time" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input id="location" placeholder="Enter location or meeting link" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input id="description" placeholder="Enter event description" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-primary uppercase tracking-wide">Total Events</p>
                  <p className="text-lg font-semibold">{stats.totalEvents}</p>
                </div>
                <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Calendar className="size-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">This Month</p>
                  <p className="text-lg font-semibold">{stats.thisMonth}</p>
                </div>
                <div className="size-8 rounded-md bg-muted flex items-center justify-center">
                  <Clock className="size-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Meetings</p>
                  <p className="text-lg font-semibold">{stats.meetings}</p>
                </div>
                <div className="size-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                  <Users className="size-4 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Deadlines</p>
                  <p className="text-lg font-semibold">{stats.deadlines}</p>
                </div>
                <div className="size-8 rounded-md bg-red-500/10 flex items-center justify-center">
                  <Bell className="size-4 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        setCurrentMonth(new Date())
                        setSelectedDate(new Date())
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-[10px] font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {allDays.map((day, index) => {
                    const dayEvents = getEventsForDate(day)
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isSelected = isSameDay(day, selectedDate)
                    const isTodayDate = isToday(day)

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "aspect-square p-1 rounded-lg text-xs relative transition-colors",
                          isCurrentMonth ? "text-foreground" : "text-muted-foreground/50",
                          isSelected && "bg-primary text-primary-foreground",
                          !isSelected && isTodayDate && "bg-primary/10 text-primary font-semibold",
                          !isSelected && !isTodayDate && "hover:bg-muted"
                        )}
                      >
                        <span className="block">{format(day, 'd')}</span>
                        {dayEvents.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {dayEvents.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "size-1 rounded-full",
                                  isSelected ? "bg-primary-foreground" : "bg-primary"
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Events */}
            <Card className="mt-4">
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-semibold">
                  Events for {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No events scheduled</p>
                    <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="size-3.5 mr-1.5" />
                      Add Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDateEvents.map((event) => {
                      const config = eventTypeConfig[event.type]
                      const Icon = config.icon
                      return (
                        <div key={event.id} className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3">
                              <div className={cn("size-8 rounded-md flex items-center justify-center shrink-0", config.color)}>
                                <Icon className="size-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{event.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {event.startTime} - {event.endTime}
                                  </span>
                                  {event.location && (
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      <MapPin className="size-3" />
                                      {event.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-xs">Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-xs text-destructive">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Events Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const config = eventTypeConfig[event.type]
                    const Icon = config.icon
                    return (
                      <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className={cn("size-8 rounded-md flex items-center justify-center shrink-0", config.color)}>
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{event.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {format(event.date, 'MMM d')} at {event.startTime}
                          </p>
                          <Badge variant="secondary" className={cn("text-[9px] h-4 px-1.5 mt-1", config.color)}>
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
