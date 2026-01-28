import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../features/auth/authSlice'
import type { AppDispatch, RootState } from '../app/store'
import { Navigate, Link } from 'react-router-dom'

// Login page component
export default function Login() {

  // Redux hooks
  const dispatch = useDispatch<AppDispatch>()

  // Select auth state from Redux store
  const { user, loading, error } = useSelector((s: RootState) => s.auth)

  // Local state for form inputs
  const [email, setEmail] = useState('')

  // Local state for form inputs
  const [password, setPassword] = useState('')

  // Redirect to home if already logged in
  if (user) return <Navigate to="/" replace />

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {

    // Prevent default form submission behavior
    e.preventDefault()

    // Dispatch login action
    dispatch(login({ email, password }))
  }

  // Render Login page
  return (
    <div className='auth-box'>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Error message */}
      {error && <p className='error'>{error}</p>}

      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
