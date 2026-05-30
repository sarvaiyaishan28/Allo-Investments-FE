'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AlloLogoProps {
  size?: 'sm' | 'md' | 'lg'
  collapsed?: boolean
  className?: string
}

export function AlloLogo({ size = 'md', collapsed = false, className }: AlloLogoProps) {
  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28,
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }

  if (collapsed) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Image
          src="/allo-icon.png"
          alt="Allo"
          width={iconSizes[size]}
          height={iconSizes[size]}
          className="object-contain"
        />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/allo-icon.png"
        alt="Allo"
        width={iconSizes[size]}
        height={iconSizes[size]}
        className="object-contain"
        priority
      />
      <span className={cn('font-bold tracking-tight', textSizes[size])}>
        ALLO
      </span>
    </div>
  )
}
