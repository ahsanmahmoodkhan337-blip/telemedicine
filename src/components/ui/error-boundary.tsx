import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = (): void => {
    window.location.href = '/'
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="mb-6 max-w-md text-gray-500 dark:text-gray-400">
            An unexpected error occurred. You can try again or return to the home page.
          </p>
          {this.state.error && (
            <details className="mb-6 max-w-lg rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 p-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-500 dark:text-gray-400">
                Error details
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-red-600 dark:text-red-400">
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleGoHome}>
              Go Home
            </Button>
            <Button onClick={this.handleRetry}>
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}