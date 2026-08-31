import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Placeholder from './pages/Placeholder'
import AnnouncementBar from './components/layout/AnnouncementBar'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f2efe8] text-[#17211f]">
         <AnnouncementBar />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Placeholder />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
