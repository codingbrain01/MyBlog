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

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, hydrated } = useSelector((state: RootState) => state.auth)

  if (!hydrated) return <Loader />

  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { hydrated } = useSelector((state: RootState) => state.auth)

  // Hydrate the user on app start
  useEffect(() => {
    dispatch(hydrateUser())
  }, [dispatch])

  if (!hydrated) return <Loader />

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

        <Route
          path="/logout"
          element={
            <PrivateRoute>
              <Logout />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
