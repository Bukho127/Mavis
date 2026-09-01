import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Placeholder from './pages/Placeholder'
import AnnouncementBar from './components/layout/AnnouncementBar'
import SignIn from './components/auth/SignIn'
import Register from './components/auth/Register'
import { loginUser, registerUser, loginWithGoogle } from './api'

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  const handleLogin = async (formData) => {
    await loginUser(formData)
    navigate('/')
  }

  const handleRegister = async (formData) => {
    await registerUser(formData)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#f2efe8] text-[#17211f]">
      {!isAuthPage && <AnnouncementBar />}
      {!isAuthPage && <Navbar />}
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
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App