import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../features/auth/authSlice'
import type { AppDispatch, RootState } from '../app/store'
import { Navigate, Link } from 'react-router-dom'

// Register page component
export default function Register() {

  // Redux hooks
  const dispatch = useDispatch<AppDispatch>()

  // Select auth state from Redux store
  const { user, loading, error } = useSelector((s: RootState) => s.auth)

  // Local state for form inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  // Redirect to home if already logged in
  if (user) return <Navigate to="/" replace />

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {

    // Prevent default form submission behavior
    e.preventDefault()

    // Dispatch register action
    dispatch(register({ email, password, name }))
  }

  // Render Register page
  return (
    <div className='auth-box'>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input type="name"
        placeholder='Username'
        required
        value={name}
        onChange={e => setName(e.target.value)}
        />

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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {error && <p className='error'>{error}</p>}

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
