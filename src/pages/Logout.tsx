import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import type { AppDispatch } from '../app/store'
import { Navigate } from 'react-router-dom'

export default function Logout() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(logout())
  }, [dispatch])

  return <Navigate to="/login" replace />
}
