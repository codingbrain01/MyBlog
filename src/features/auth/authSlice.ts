import { supabase } from '../../lib/supabaseClient'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { registerUser, loginUser, logoutUser } from './authService'

interface AuthState {
  user: any | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
}

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }) =>
    registerUser(email, password)
)

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) =>
    loginUser(email, password)
)

export const hydrateUser = createAsyncThunk(
  'auth/hydrate',
  async () => {
    const { data } = await supabase.auth.getUser()
    return data.user
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutUser()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(register.pending, s => { s.loading = true })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false
        s.user = a.payload
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false
        s.error = a.error.message || 'Registration failed'
      })
      .addCase(login.fulfilled, (s, a) => {
        s.user = a.payload
        s.error = null
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false
        s.error = a.error.message || 'Invalid credentials'
      })
      .addCase(logout.fulfilled, s => {
        s.user = null
      })
      .addCase(hydrateUser.fulfilled, (s, a) => {
        s.user = a.payload
      })
  },
})

export default authSlice.reducer
