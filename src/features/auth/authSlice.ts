import { supabase } from '../../lib/supabaseClient'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { registerUser, loginUser, logoutUser } from './authService'

interface AuthUser {
  id: string
  email: string | null
  name: string
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  hydrated: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  hydrated: false,
  error: null,
}

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (
    { email, password, name }: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const supaUser = await registerUser(email, password)
      if (!supaUser) return rejectWithValue('Registration failed')

      return {
        id: supaUser.id,
        email: supaUser.email ?? null,
        name: name || 'Unknown',
      }
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// Login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const supaUser = await loginUser(email, password)
      if (!supaUser) return rejectWithValue('Login failed')

      return {
        id: supaUser.id,
        email: supaUser.email ?? null,
        name: 'Unknown', // safe default to prevent 404
      }
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// Hydrate user
export const hydrateUser = createAsyncThunk<AuthUser | null>(
  'auth/hydrate',
  async () => {
    try {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return null

      return {
        id: user.id,
        email: user.email ?? null,
        name: 'Unknown', // safe default
      }
    } catch {
      return null
    }
  }
)

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await logoutUser()
  } catch {
    // ignore
  }
})

// authSlice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Register
      .addCase(register.pending, s => { s.loading = true; s.error = null })
      .addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; s.hydrated = true })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; s.hydrated = true })

      // Login
      .addCase(login.pending, s => { s.loading = true; s.error = null })
      .addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; s.hydrated = true })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; s.hydrated = true })

      // Hyrdrate
      .addCase(hydrateUser.pending, s => { s.loading = true })
      .addCase(hydrateUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; s.hydrated = true })
      .addCase(hydrateUser.rejected, s => { s.loading = false; s.hydrated = true })

      // Logout
      .addCase(logout.fulfilled, s => {
        s.user = null
        s.loading = false
        s.error = null
        s.hydrated = true
      })
  },
})

export default authSlice.reducer
