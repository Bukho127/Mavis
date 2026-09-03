import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Placeholder from './pages/Placeholder'
import AnnouncementBar from './components/layout/AnnouncementBar'
import SignIn from './components/auth/SignIn'
import Register from './components/auth/Register'
import { loginUser, registerUser, loginWithGoogle } from './api'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/dashboard/ProtectedRoute'
import DashboardLayout from './components/dashboard/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import Interview from './pages/dashboard/Interview'
import JobTracker from './pages/dashboard/JobTracker'
import Messages from './pages/dashboard/Messages'
import Feedback from './pages/dashboard/Feedback'
import AIPersonalities from './pages/dashboard/AIPersonalities'
import Exports from './pages/dashboard/Exports'
import Privacy from './pages/dashboard/Privacy'
import Settings from './pages/dashboard/Settings'
import Billing from './pages/dashboard/Billing'
import Appearance from './pages/dashboard/Appearance'
import Support from './pages/dashboard/Support'

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const isDashboardPage = location.pathname.startsWith('/dashboard')

  const handleLogin = async (formData) => {
    const data = await loginUser(formData)
    login(data.token)
    navigate('/dashboard')
  }

  const handleRegister = async (formData) => {
    const data = await registerUser(formData)
    login(data.token)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f2efe8] text-[#17211f]">
      {!isAuthPage && !isDashboardPage && <AnnouncementBar />}
      {!isAuthPage && !isDashboardPage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={<SignIn onLogin={handleLogin} onGoogleLogin={loginWithGoogle} />}
          />
          <Route
            path="/register"
            element={<Register onRegister={handleRegister} onGoogleLogin={loginWithGoogle} />}
          />
          <Route path="/about" element={<Placeholder />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="interview" element={<Interview />} />
              <Route path="jobs" element={<JobTracker />} />
              <Route path="messages" element={<Messages />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="personalities" element={<AIPersonalities />} />
              <Route path="exports" element={<Exports />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="settings" element={<Settings />} />
              <Route path="billing" element={<Billing />} />
              <Route path="appearance" element={<Appearance />} />
              <Route path="support" element={<Support />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </main>
      {!isAuthPage && !isDashboardPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
