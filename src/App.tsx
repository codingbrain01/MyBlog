import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from './app/store'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Logout from './pages/Logout'
import Blogs from './pages/Blogs'
import CreateBlog from './pages/CreateBlog'
import EditBlog from './pages/EditBlog'
import Blog from './pages/Blog'
import Loader from './components/loader'
import type { JSX } from 'react'
import { hydrateUser } from './features/auth/authSlice'

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }: { children: JSX.Element }) => {

  // Select auth state from Redux store
  const { user, hydrated } = useSelector((state: RootState) => state.auth)

  // Show loader while session is hydrating
  if (!hydrated) return <Loader />

  // Render children if user is logged in, else redirect to register
  return user ? children : <Navigate to="/register" replace />
}

// Main App component
export default function App() {

  // Redux hooks
  const dispatch = useDispatch<AppDispatch>()

  // Select auth state from Redux store
  const { hydrated } = useSelector((state: RootState) => state.auth)

  // Hydrate user session on app mount
  useEffect(() => {

    // Dispatch hydrateUser action
    dispatch(hydrateUser())
  }, [dispatch])

  // Show loader while session is hydrating
  if (!hydrated) return <Loader />

  // Render application routes
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Blogs />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreateBlog />
            </PrivateRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <EditBlog />
            </PrivateRoute>
          }
        />

        <Route
          path="/blog/:id"
          element={
            <PrivateRoute>
              <Blog />
            </PrivateRoute>
          }
        />

        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  )
}
