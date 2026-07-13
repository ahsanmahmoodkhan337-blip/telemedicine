import { Routes, Route, Navigate } from 'react-router-dom'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import AuthLayout from '@/routes/auth/AuthLayout'
import SignInPage from '@/routes/auth/SignInPage'
import SignUpPage from '@/routes/auth/SignUpPage'
import PatientDashboard from '@/routes/patient/PatientDashboard'
import PatientSearch from '@/routes/patient/PatientSearch'
import VitalsLogger from '@/routes/patient/VitalsLogger'
import DoctorDashboard from '@/routes/doctor/DoctorDashboard'
import SOAPEditorPage from '@/routes/doctor/SOAPEditorPage'
import PharmacistInbox from '@/routes/pharmacist/PharmacistInbox'
import PhysioDashboard from '@/routes/physio/PhysioDashboard'
import NutritionistPatients from '@/routes/nutritionist/NutritionistPatients'
import AdminVerification from '@/routes/admin/AdminVerification'
import NotFoundPage from '@/routes/NotFoundPage'
import LandingPage from '@/routes/LandingPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="sign-in" element={<SignInPage />} />
        <Route path="sign-up" element={<SignUpPage />} />
      </Route>
      <Route element={<SidebarLayout />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/search" element={<PatientSearch />} />
        <Route path="/patient/vitals" element={<VitalsLogger />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments/:id" element={<SOAPEditorPage />} />
        <Route path="/pharmacist/inbox" element={<PharmacistInbox />} />
        <Route path="/physio/dashboard" element={<PhysioDashboard />} />
        <Route path="/nutritionist/patients/:id" element={<NutritionistPatients />} />
        <Route path="/admin/verification" element={<AdminVerification />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}