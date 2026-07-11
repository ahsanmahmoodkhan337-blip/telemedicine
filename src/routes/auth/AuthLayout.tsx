import { Outlet } from 'react-router-dom'
import logoLight from '@/assets/logo.png'
import logoDark from '@/assets/logo-white.png'
import { useState, useEffect } from 'react'

export default function AuthLayout() {
  const [darkMode, setDarkMode] = useState(false)
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'))
  }, [])

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2">
            <img
              src={darkMode ? logoDark : logoLight}
              alt="Healthcare Hustlers"
              className="h-8 w-auto"
            />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Healthcare Hustlers</span>
          </div>
          <Outlet />
        </div>
      </div>
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-700" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Your Complete Healthcare Platform</h2>
            <p className="text-lg opacity-90 max-w-md">
              Connecting patients with doctors, physiotherapists, pharmacists, and nutritionists in one seamless workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}