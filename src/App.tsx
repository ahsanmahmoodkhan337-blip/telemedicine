import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { LoadingSkeleton } from '@/components/ui/loading-states'

const AuthLayout = lazy(() => import('@/routes/auth/AuthLayout'))
const SignInPage = lazy(() => import('@/routes/auth/SignInPage'))
const SignUpPage = lazy(() => import('@/routes/auth/SignUpPage'))
const PatientDashboard = lazy(() => import('@/routes/patient/PatientDashboard'))
const PatientSearch = lazy(() => import('@/routes/patient/PatientSearch'))
const VitalsLogger = lazy(() => import('@/routes/patient/VitalsLogger'))
const DoctorDashboard = lazy(() => import('@/routes/doctor/DoctorDashboard'))
const SOAPEditorPage = lazy(() => import('@/routes/doctor/SOAPEditorPage'))
const PharmacistInbox = lazy(() => import('@/routes/pharmacist/PharmacistInbox'))
const PhysioDashboard = lazy(() => import('@/routes/physio/PhysioDashboard'))
const NutritionistPatients = lazy(() => import('@/routes/nutritionist/NutritionistPatients'))
const AdminVerification = lazy(() => import('@/routes/admin/AdminVerification'))
const NotFoundPage = lazy(() => import('@/routes/NotFoundPage'))
const LandingPage = lazy(() => import('@/routes/LandingPage'))

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSkeleton title="Loading page..." />}>
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/"
          element={
            <PageSuspense>
              <LandingPage />
            </PageSuspense>
          }
        />
        <Route
          path="/auth"
          element={
            <PageSuspense>
              <AuthLayout />
            </PageSuspense>
          }
        >
          <Route index element={<Navigate to="/auth/sign-in" replace />} />
          <Route
            path="sign-in"
            element={
              <PageSuspense>
                <SignInPage />
              </PageSuspense>
            }
          />
          <Route
            path="sign-up"
            element={
              <PageSuspense>
                <SignUpPage />
              </PageSuspense>
            }
          />
        </Route>
        <Route element={<SidebarLayout />}>
          <Route
            path="/patient/dashboard"
            element={
              <PageSuspense>
                <PatientDashboard />
              </PageSuspense>
            }
          />
          <Route
            path="/patient/search"
            element={
              <PageSuspense>
                <PatientSearch />
              </PageSuspense>
            }
          />
          <Route
            path="/patient/vitals"
            element={
              <PageSuspense>
                <VitalsLogger />
              </PageSuspense>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <PageSuspense>
                <DoctorDashboard />
              </PageSuspense>
            }
          />
          <Route
            path="/doctor/appointments/:id"
            element={
              <PageSuspense>
                <SOAPEditorPage />
              </PageSuspense>
            }
          />
          <Route
            path="/pharmacist/inbox"
            element={
              <PageSuspense>
                <PharmacistInbox />
              </PageSuspense>
            }
          />
          <Route
            path="/physio/dashboard"
            element={
              <PageSuspense>
                <PhysioDashboard />
              </PageSuspense>
            }
          />
          <Route
            path="/nutritionist/patients/:id"
            element={
              <PageSuspense>
                <NutritionistPatients />
              </PageSuspense>
            }
          />
          <Route
            path="/admin/verification"
            element={
              <PageSuspense>
                <AdminVerification />
              </PageSuspense>
            }
          />
        </Route>
        <Route
          path="*"
          element={
            <PageSuspense>
              <NotFoundPage />
            </PageSuspense>
          }
        />
      </Routes>
    </ErrorBoundary>
  )
}