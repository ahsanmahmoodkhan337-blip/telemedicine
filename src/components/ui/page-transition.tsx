import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn('animate-fade-in', className)}>
      {children}
    </div>
  )
}