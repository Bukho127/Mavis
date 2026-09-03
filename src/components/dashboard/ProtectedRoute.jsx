import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute() {
  const { token } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate replace to="/login" state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
