import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import type { RootState } from '../app/store'
import type { JSX } from 'react'

export default function RequireAuth({ children }: { children: JSX.Element }) {
    const { user } = useSelector((s: RootState) => s.auth)

    return user ? children : <Navigate to="/login" replace />
}
