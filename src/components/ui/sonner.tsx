import { Toaster as SonnerToaster } from 'sonner'

function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--color-slate-900)',
          color: 'white',
          border: '1px solid var(--color-gray-700)',
        },
      }}
    />
  )
}

export { ToastProvider }