import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Placeholder from './pages/Placeholder'
import AnnouncementBar from './components/layout/AnnouncementBar'
import SignIn from './components/auth/SignIn'

function AppLayout() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-[#f2efe8] text-[#17211f]">
      {!isAuthPage && <AnnouncementBar />}
      {!isAuthPage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<SignIn />} />
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
