'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

const SheetContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({ open: false, onOpenChange: () => {} })

function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </SheetContext.Provider>
  )
}

function SheetTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { onOpenChange } = React.useContext(SheetContext)
  return asChild ? (
    React.cloneElement(children as React.ReactElement, { onClick: () => onOpenChange(true) })
  ) : (
    <button onClick={() => onOpenChange(true)}>{children}</button>
  )
}

function SheetContent({
  children,
  className,
  side = 'right',
}: {
  children: React.ReactNode
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  const { open, onOpenChange } = React.useContext(SheetContext)

  if (!open) return null

  const sideClasses = {
    top: 'inset-x-0 top-0 border-b',
    bottom: 'inset-x-0 bottom-0 border-t',
    left: 'inset-y-0 left-0 border-r',
    right: 'inset-y-0 right-0 border-l',
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />
      <div
        className={cn(
          'fixed z-50 gap-4 bg-white dark:bg-slate-900 p-6 shadow-lg',
          sideClasses[side],
          className
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </>
  )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-slate-900 dark:text-slate-50', className)} {...props} />
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle }