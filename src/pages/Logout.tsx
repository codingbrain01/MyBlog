import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import type { AppDispatch } from '../app/store'
import { Navigate } from 'react-router-dom'

// Logout page component
export default function Logout() {

  // Redux hooks
  const dispatch = useDispatch<AppDispatch>()

  // Perform logout on component mount
  useEffect(() => {
    dispatch(logout())
  }, [dispatch])

  // Redirect to login page after logout
  return <Navigate to="/login" replace />
}
