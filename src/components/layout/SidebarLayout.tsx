import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import {
  LayoutDashboard,
  Search,
  Heart,
  ClipboardList,
  Pill,
  Dumbbell,
  Apple,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Stethoscope,
  ChevronDown,
  Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useState, useEffect } from 'react'
import NotificationBell from '@/components/notifications/NotificationBell'

const navItems = [
  { path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['patient'] },
  { path: '/patient/search', label: 'Find Doctors', icon: Search, roles: ['patient'] },
  { path: '/patient/vitals', label: 'My Vitals', icon: Heart, roles: ['patient'] },
  { path: '/doctor/dashboard', label: 'My Patients', icon: Stethoscope, roles: ['doctor'] },
  { path: '/doctor/appointments/1', label: 'SOAP Editor', icon: ClipboardList, roles: ['doctor'] },
  { path: '/pharmacist/inbox', label: 'Prescriptions', icon: Pill, roles: ['pharmacist'] },
  { path: '/physio/dashboard', label: 'ROM Tracker', icon: Dumbbell, roles: ['physiotherapist'] },
  { path: '/nutritionist/patients/1', label: 'Nutrition Plans', icon: Apple, roles: ['nutritionist'] },
  { path: '/admin/verification', label: 'Verification', icon: ShieldCheck, roles: ['admin'] },
]

// Mock user context — will be replaced with real auth
const MOCK_USER = {
  name: 'Dr. Ahmed Khan',
  role: 'doctor' as const,
  initials: 'AK',
}

export function SidebarLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const filteredNav = navItems.filter(item => item.roles.includes(MOCK_USER.role))

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">HealthCare Hub</span>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 lg:px-6">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <NotificationBell />

            <div className="flex items-center gap-3 ml-2">
              <div className="text-right text-sm">
              <p className="font-medium text-slate-900 dark:text-white">{MOCK_USER.name}</p>
              <p className="text-gray-500 capitalize">{MOCK_USER.role}</p>
            </div>
            <Avatar>
              <AvatarFallback className="bg-accent text-white">{MOCK_USER.initials}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/auth/sign-in')}
            >
              <LogOut className="h-5 w-5" />
            </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}