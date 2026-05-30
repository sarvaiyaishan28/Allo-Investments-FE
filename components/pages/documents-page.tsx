'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Upload,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  Folder,
  MoreHorizontal,
  Eye,
  Trash2,
  Share2,
  Grid3X3,
  List,
  Plus,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { fetchFiles } from '@/lib/api-client'

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(type: string) {
  if (type.includes('pdf')) {
    return <FileText className="size-4 text-red-500" />
  }
  if (type.includes('image')) {
    return <Image className="size-4 text-blue-500" />
  }
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) {
    return <FileSpreadsheet className="size-4 text-emerald-500" />
  }
  return <File className="size-4 text-muted-foreground" />
}

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list')
  const [files, setFiles] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchFiles()
      .then(data => {
        setFiles(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch files', err)
        setLoading(false)
      })
  }, [])

  const filteredFiles = React.useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery, files])

  const stats = React.useMemo(() => {
    const totalFiles = files.length
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    const pdfCount = files.filter(f => f.type.includes('pdf')).length
    
    return { totalFiles, totalSize, pdfCount }
  }, [files])

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Documents</h1>
            <p className="text-sm text-muted-foreground">Manage all your documents and files in one place.</p>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-xs">
            <Plus className="size-3.5" />
            Upload
          </Button>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-primary uppercase tracking-wide">Total Files</p>
                  <p className="text-lg font-semibold">{stats.totalFiles}</p>
                </div>
                <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Folder className="size-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total Size</p>
                  <p className="text-lg font-semibold">{formatFileSize(stats.totalSize)}</p>
                </div>
                <div className="size-8 rounded-md bg-muted flex items-center justify-center">
                  <File className="size-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">PDFs</p>
                  <p className="text-lg font-semibold">{stats.pdfCount}</p>
                </div>
                <div className="size-8 rounded-md bg-red-500/10 flex items-center justify-center">
                  <FileText className="size-4 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
            <Filter className="size-3.5" />
            Filter
          </Button>

          <div className="flex items-center border rounded-md h-9">
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon"
              className="size-9 rounded-r-none"
              onClick={() => setViewMode('list')}
            >
              <List className="size-4" />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon"
              className="size-9 rounded-l-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="size-4" />
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-9">
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </motion.div>

        {/* Files List/Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {viewMode === 'list' ? (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Size</TableHead>
                      <TableHead className="text-xs">Uploaded By</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Folder className="size-8 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">No documents found</p>
                            <Button variant="outline" size="sm" className="gap-1.5 mt-2 text-xs">
                              <Upload className="size-3.5" />
                              Upload your first document
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFiles.map((file) => (
                        <TableRow key={file.id} className="group">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              {getFileIcon(file.type)}
                              <span className="text-xs font-medium">{file.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {file.uploadedBy}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-xs">
                                  <Eye className="size-3.5 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">
                                  <Download className="size-3.5 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs">
                                  <Share2 className="size-3.5 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs text-destructive">
                                  <Trash2 className="size-3.5 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredFiles.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Folder className="size-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No documents found</p>
                    <Button variant="outline" size="sm" className="gap-1.5 mt-4 text-xs">
                      <Upload className="size-3.5" />
                      Upload your first document
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredFiles.map((file) => (
                  <Card key={file.id} className="group cursor-pointer hover:border-primary/30 transition-colors">
                    <CardContent className="py-3 px-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="size-12 rounded-lg bg-muted flex items-center justify-center mb-2">
                          {getFileIcon(file.type)}
                        </div>
                        <p className="text-xs font-medium truncate w-full">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatFileSize(file.size)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
