import { Link } from 'react-router-dom'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Stethoscope, Search, Shield, Activity, Apple, Pill, ArrowRight } from 'lucide-react'
import logoLight from '@/assets/logo.png'
import logoDark from '@/assets/logo-white.png'

const features = [
  { icon: Stethoscope, title: 'Multi-Specialty Telemedicine', desc: 'Connect with doctors, physiotherapists, pharmacists & nutritionists' },
  { icon: Search, title: 'Smart Provider Search', desc: 'Find providers by specialty, city, fee range, language & ratings' },
  { icon: Activity, title: 'Vitals Tracking', desc: 'Log BP, weight, glucose & temperature with clinical range indicators' },
  { icon: Shield, title: 'SOAP Documentation', desc: 'Collaborative SOAP notes with ICD-10 coding & restricted meds safeguard' },
  { icon: Apple, title: 'AI Nutrition Planning', desc: 'Generate meal plans with macro targets & allergen filters' },
  { icon: Pill, title: 'Pharmacy Integration', desc: 'e-Prescriptions with drug interaction alerts and dispense tracking' },
]

const roles = [
  { name: 'Patient', desc: 'Book appointments, track vitals, find providers', path: '/auth/sign-up' },
  { name: 'Doctor', desc: 'SOAP notes, e-prescriptions, patient management', path: '/auth/sign-up' },
  { name: 'Pharmacist', desc: 'Review & dispense prescriptions, drug interaction checks', path: '/auth/sign-up' },
  { name: 'Physiotherapist', desc: 'ROM tracking, joint angle measurement, compensation alerts', path: '/auth/sign-up' },
  { name: 'Nutritionist', desc: 'Meal planning, macro targets, AI menu builder', path: '/auth/sign-up' },
]

export default function LandingPage() {
  const [darkMode, setDarkMode] = React.useState(false)
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDarkMode(isDark)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900">
        <div className="container-center flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={darkMode ? logoDark : logoLight}
              alt="Healthcare Hustlers"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-slate-900 dark:text-white">Healthcare Hustlers</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container-center text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Your Complete{' '}
            <span className="text-accent">Healthcare</span>{' '}
            Platform
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Connect with doctors, physiotherapists, pharmacists, and nutritionists
            in a single virtual workspace. Built for South Asian healthcare markets.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth/sign-in">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-slate-900/50 py-20">
        <div className="container-center">
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">Everything You Need</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-gray-500">
            A complete platform for healthcare practitioners and patients
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-950/50 mb-4">
                  <f.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20">
        <div className="container-center">
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">Who Is It For?</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-gray-500">
            Five role-tailored experiences in one platform
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {roles.map((r) => (
              <div key={r.name} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{r.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{r.desc}</p>
                <Link to={r.path}>
                  <Button variant="outline" size="sm">Join as {r.name}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 py-8">
        <div className="container-center text-center text-sm text-gray-500">
          <p>© 2026 Healthcare Hustlers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}