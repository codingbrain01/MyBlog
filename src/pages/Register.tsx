import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../features/auth/authSlice'
import type { AppDispatch, RootState } from '../app/store'
import { Navigate, Link } from 'react-router-dom'

export default function Register() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, loading, error } = useSelector((s: RootState) => s.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  if (user) return <Navigate to="/" replace />

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(register({ email, password, name }))
  }

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
