import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function LoadingSkeleton({ title = 'Loading...' }: { title?: string }) {
  return (
    <div className="container-center py-8">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyState({
  title = 'No data found',
  description = 'There are no items to display here yet.',
  icon,
}: {
  title?: string
  description?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">{description}</p>
    </div>
  )
}

function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this page. Please try again.',
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-red-500">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export { LoadingSkeleton, EmptyState, ErrorState }