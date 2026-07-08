import { Outlet } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-sm">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">HealthCare Hub</span>
          </div>
          <Outlet />
        </div>
      </div>
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600 to-secondary-700" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Your Complete Telehealth Platform</h2>
            <p className="text-lg opacity-90 max-w-md">
              Connecting patients with doctors, physiotherapists, pharmacists, and nutritionists in one seamless workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}