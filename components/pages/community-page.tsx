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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

const upcomingEvents: any[] = [
  {
    id: 1,
    date: '15 Sep 2026',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60',
    title: 'Q3 Investor Summit',
    location: 'Virtual Event',
    time: '10:00 AM - 12:00 PM EST'
  },
  {
    id: 2,
    date: '22 Oct 2026',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?w=500&auto=format&fit=crop&q=60',
    title: 'Founders & Funders Mixer',
    location: 'New York City, NY',
    time: '6:00 PM - 9:00 PM EST'
  }
]

const eventVideos: any[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=500&auto=format&fit=crop&q=60',
    title: 'State of Venture Capital 2026'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=500&auto=format&fit=crop&q=60',
    title: 'Navigating Tech Regulations'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&auto=format&fit=crop&q=60',
    title: 'Deep Tech Investment Strategies'
  }
]

const pastEvents: any[] = [
  {
    id: 1,
    date: 'Aug 24, 2026',
    day: 'Thursday',
    time: '10:00 AM - 11:30 AM',
    title: 'Web3 & Crypto Roundtable',
    location: 'Virtual',
    description: 'An in-depth discussion on the evolving landscape of decentralized finance and opportunities in the crypto space.',
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    date: 'Jul 15, 2026',
    day: 'Wednesday',
    time: '2:00 PM - 4:00 PM',
    title: 'Healthcare Innovation Panel',
    location: 'In Person - Boston, MA',
    description: 'Experts shared insights on biotech breakthroughs and digital health platforms revolutionizing patient care.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=60'
  }
]

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
                <div className="space-y-4">
                  <div className="flex gap-3 items-start border-b pb-4">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">AF</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Alice Freeman</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">What are your thoughts on the new AI SaaS deals on the platform?</p>
                      <div className="flex gap-3 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"><ThumbsUp className="size-3" /> 12</span>
                        <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"><MessageSquare className="size-3" /> 4</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start border-b pb-4">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">BS</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Bob Smith</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">Looking for co-investors in the upcoming Real Estate syndication.</p>
                      <div className="flex gap-3 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"><ThumbsUp className="size-3" /> 8</span>
                        <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"><MessageSquare className="size-3" /> 2</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">CK</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Chloe Kim</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">Great insights from yesterday's founders mixer. Anyone got notes?</p>
                      <div className="flex gap-3 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"><ThumbsUp className="size-3" /> 24</span>
                        <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"><MessageSquare className="size-3" /> 9</span>
                      </div>
                    </div>
                  </div>
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
