import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage, Privacy, Terms, Contact } from '../features/landing'
import { ScrollToTop } from "../shared";
import { Login, SignUp, ForgotPassword } from '../features/auth'
import { Dashboard, Analytics, Residents, Households, Eid, QRVerification, UserAccount } from '../features/dashboard'
import ProtectedRoute from './ProtectedRoute'
import RoleGuard from './RoleGuard'

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ── Public routes ─────────────────────────────────── */}
        <Route path="/"               element={<LandingPage />} />
        <Route path="/home"           element={<LandingPage />} />
        <Route path="/privacy"        element={<Privacy />} />
        <Route path="/terms"          element={<Terms />} />
        <Route path="/contact"        element={<Contact />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/signup"         element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Unauthorized fallback ─────────────────────────── */}
        <Route
          path="/unauthorized"
          element={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-500 mb-4">You do not have permission to view this page.</p>
                <a href="/login" className="text-[#005F02] underline font-medium">Back to Login</a>
              </div>
            </div>
          }
        />

        {/* ── Protected routes (authentication required) ────── */}
        <Route element={<ProtectedRoute />}>

          {/* Staff + Superadmin only */}
          <Route element={<RoleGuard roles={['staff', 'superadmin']} />}>
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/analytics"      element={<Analytics />} />
            <Route path="/residents"      element={<Residents />} />
            <Route path="/households"     element={<Households />} />
            <Route path="/eid"            element={<Eid />} />
            <Route path="/qr-verification" element={<QRVerification />} />
          </Route>

          {/* All authenticated roles (staff, superadmin, resident) */}
          <Route path="/user-account" element={<UserAccount />} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes