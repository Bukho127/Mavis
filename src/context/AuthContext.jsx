import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()
const AUTH_TOKEN_STORAGE_KEY = 'mavis-token'
const LEGACY_AUTH_TOKEN_STORAGE_KEY = 'token'
const AUTH_TOKEN_UPDATED_EVENT = 'auth:token-updated'
const AUTH_LOGOUT_EVENT = 'auth:logout'

function readStoredToken() {
  if (typeof window === 'undefined') {
    return null
  }

  return (
    sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ||
    localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ||
    sessionStorage.getItem(LEGACY_AUTH_TOKEN_STORAGE_KEY) ||
    localStorage.getItem(LEGACY_AUTH_TOKEN_STORAGE_KEY) ||
    null
  )
}

function persistToken(token) {
  if (typeof window === 'undefined') {
    return
  }

  if (token) {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    localStorage.setItem(LEGACY_AUTH_TOKEN_STORAGE_KEY, token)
  } else {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(LEGACY_AUTH_TOKEN_STORAGE_KEY)
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken())

  const login = (newToken) => {
    persistToken(newToken)
    setToken(newToken)
    window.dispatchEvent(new CustomEvent(AUTH_TOKEN_UPDATED_EVENT, { detail: { token: newToken } }))
  }

  const logout = () => {
    persistToken(null)
    setToken(null)
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
  }

  useEffect(() => {
    const syncToken = () => {
      setToken(readStoredToken())
    }

    window.addEventListener(AUTH_TOKEN_UPDATED_EVENT, syncToken)
    window.addEventListener(AUTH_LOGOUT_EVENT, syncToken)
    window.addEventListener('storage', syncToken)

    return () => {
      window.removeEventListener(AUTH_TOKEN_UPDATED_EVENT, syncToken)
      window.removeEventListener(AUTH_LOGOUT_EVENT, syncToken)
      window.removeEventListener('storage', syncToken)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}