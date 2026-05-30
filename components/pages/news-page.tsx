'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { fetchNews } from '@/lib/api-client'
import type { NewsArticle } from '@/lib/types'

const categories = [
  { id: 'all', label: 'All News', icon: null },
  { id: 'spacex', label: 'SpaceX', icon: 'SX' },
  { id: 'openai', label: 'OpenAI', icon: 'OA' },
  { id: 'anthropic', label: 'Anthropic', icon: 'AN' },
  { id: 'figure-ai', label: 'Figure AI', icon: 'FA' },
  { id: 'neuralink', label: 'Neuralink', icon: 'NL' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

function FeaturedArticle({ article }: { article: NewsArticle }) {
  return (
    <motion.div variants={item}>
      <Link href={`/news/${article.id}`}>
        <Card className="group relative overflow-hidden h-[400px]">
          <div className="absolute inset-0">
            <Image
              src={article.imageUrl || '/placeholder.jpg'}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>
          <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="size-6 border border-white/20">
                <AvatarFallback className="text-[10px] bg-white/10 text-white">
                  {article.source.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{article.source}</span>
              <span className="text-sm text-white/60">
                {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <motion.div variants={item}>
      <Link href={`/news/${article.id}`}>
        <Card className="group h-full overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative aspect-[16/10]">
            <Image
              src={article.imageUrl || '/placeholder.jpg'}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
              {article.category}
            </Badge>
          </div>
          <CardContent className="p-4">
            <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
              {article.title}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {article.summary}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="size-5">
                <AvatarFallback className="text-[8px]">
                  {article.source.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span>{article.source}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

function SidebarArticle({ article }: { article: NewsArticle }) {
  return (
    <motion.div variants={item}>
      <Link href={`/news/${article.id}`} className="group flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h4>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Avatar className="size-4">
              <AvatarFallback className="text-[8px]">
                {article.source.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span>{article.source}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
          </div>
        </div>
        {article.imageUrl && (
          <div className="relative size-16 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}
      </Link>
    </motion.div>
  )
}

export function NewsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('all')
  const [newsArticles, setNewsArticles] = React.useState<NewsArticle[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchNews()
      .then(data => {
        setNewsArticles(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch news', err)
        setLoading(false)
      })
  }, [])

  const filteredArticles = React.useMemo(() => {
    if (selectedCategory === 'all') return newsArticles
    return newsArticles.filter(
      (article) => article.category.toLowerCase().replace(' ', '-') === selectedCategory
    )
  }, [selectedCategory, newsArticles])

  const featuredArticle = filteredArticles.find((a) => a.featured) || filteredArticles[0]
  const sidebarArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id).slice(0, 6)
  const bottomArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id).slice(0, 4)

  return (
    <main className="flex-1 overflow-auto">
      <div className="container max-w-7xl py-6 px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold mb-2">News</h1>
          <p className="text-muted-foreground">
            Stay up to date with the latest developments in the private markets.
          </p>
        </motion.div>

        {/* Category Filter */}
        <ScrollArea className="w-full mb-8">
          <div className="flex gap-2 pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex-shrink-0 gap-2"
              >
                {category.icon && (
                  <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-bold">
                    {category.icon}
                  </span>
                )}
                {category.label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Main Content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-muted-foreground">Top Private Markets News</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Featured + Grid */}
            <div className="space-y-6">
              {featuredArticle && <FeaturedArticle article={featuredArticle} />}
              
              <div className="grid gap-4 sm:grid-cols-2">
                {bottomArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-1">
              {sidebarArticles.map((article) => (
                <SidebarArticle key={article.id} article={article} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
