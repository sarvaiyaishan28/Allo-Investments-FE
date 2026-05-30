'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Video,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Coffee,
  Diamond,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

const upcomingEvents: any[] = []

const eventVideos: any[] = []

const pastEvents: any[] = []

export function CommunityPage() {
  return (
    <main className="flex-1 overflow-auto">
      <div className="container max-w-7xl py-6 px-4 md:px-6 space-y-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Community</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect with other investors, access exclusive events, and gain market insights.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Upcoming Events */}
          <motion.section variants={item} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Upcoming Events</h2>
            </div>
            
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const [day, month, year] = event.date.split(' ')
                return (
                  <Card key={event.id} className="hover:border-primary/30 transition-colors cursor-pointer group">
                    <CardContent className="p-0 flex items-stretch">
                      <div className="w-24 border-r flex flex-col items-center justify-center p-4 bg-muted/30 shrink-0">
                        <span className="text-3xl font-bold">{day}</span>
                        <span className="text-xs font-semibold text-muted-foreground">{month} {year}</span>
                      </div>
                      <div className="flex-1 p-5 flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <img src={event.image} alt="" className="size-12 rounded-lg object-cover bg-muted" />
                          <div>
                            <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{event.title}</h3>
                            <p className="text-sm text-muted-foreground mb-1">{event.location}</p>
                            <p className="text-xs text-muted-foreground">{event.time}</p>
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </motion.section>

          {/* Event Videos */}
          <motion.section variants={item} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Video className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Event Videos</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="size-8 rounded-full"><ChevronLeft className="size-4" /></Button>
                <Button variant="outline" size="icon" className="size-8 rounded-full"><ChevronRight className="size-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {eventVideos.map((video) => (
                <div key={video.id} className="group cursor-pointer">
                  <div className="aspect-video bg-muted rounded-xl mb-3 overflow-hidden relative">
                    <img src={video.image} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Past Events */}
          <motion.section variants={item} className="space-y-6 pt-4">
            <div className="flex items-center gap-2 border-b pb-4">
              <Badge variant="default" className="rounded-full">All</Badge>
              <Badge variant="secondary" className="rounded-full bg-muted/50 hover:bg-muted">Virtual</Badge>
              <Badge variant="secondary" className="rounded-full bg-muted/50 hover:bg-muted">In-person</Badge>
            </div>

            <div className="relative border-l ml-4 space-y-8 pb-8">
              {pastEvents.map((event) => (
                <div key={event.id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className="absolute -left-1.5 top-2 size-3 rounded-full bg-muted-foreground border-2 border-background" />
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Date Column */}
                    <div className="w-32 shrink-0 pt-1">
                      <p className="font-semibold text-sm">{event.date}</p>
                      <p className="text-xs text-muted-foreground">{event.day}</p>
                    </div>

                    {/* Event Card */}
                    <Card className="flex-1 hover:border-primary/20 transition-colors cursor-pointer group">
                      <CardContent className="p-5 flex gap-4">
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">{event.time}</p>
                            <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{event.title}</h3>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {event.location.includes('In Person') ? (
                              <Coffee className="size-3.5" />
                            ) : (
                              <Video className="size-3.5" />
                            )}
                            {event.location}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>
                        </div>
                        <img src={event.image} alt="" className="size-20 rounded-lg object-cover hidden sm:block bg-muted" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Community Insights */}
          <motion.div variants={item}>
            <Card className="bg-card">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Community Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-8 text-center text-muted-foreground border rounded-xl bg-muted/20">
                  <p className="text-sm">No new insights available at the moment.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Coffee Chats */}
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Coffee Chats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Get matched with fellow investors for meaningful 1-on-1 conversations. Expand your network and build lasting relationships.
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Request a Match
                </Button>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
        </motion.div>
      </div>
    </main>
  )
}
