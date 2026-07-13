import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/ui/page-transition'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-accent">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">Page Not Found</h2>
          <p className="mt-2 text-gray-500">The page you're looking for doesn't exist.</p>
          <Link to="/">
            <Button className="mt-6 gap-2">
              <Home className="h-4 w-4" /> Go Home
            </Button>
          </Link>
        </div>
      </div>
    </PageTransition>
  )
}