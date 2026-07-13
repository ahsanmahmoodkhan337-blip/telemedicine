import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/sonner'
import { NotificationProvider } from '@/lib/notificationStore'
import App from './App'
import './styles/app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <App />
        <ToastProvider />
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
)