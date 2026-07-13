import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('mb-4', className)}>
      <ol className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        {showHome && (
          <li>
            <Link
              to="/"
              className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:text-accent hover:bg-accent-50 dark:hover:bg-accent-950/30"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}
        {showHome && items.length > 0 && (
          <li className="text-gray-300 dark:text-gray-600">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="rounded px-1.5 py-0.5 transition-colors hover:text-accent hover:bg-accent-50 dark:hover:bg-accent-950/30"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5',
                    isLast
                      ? 'font-medium text-slate-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}