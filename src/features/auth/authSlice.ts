import { supabase } from '../../lib/supabaseClient'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { registerUser, loginUser, logoutUser } from './authService'

interface AuthUser {
  id: string
  email: string | null
  name?: string
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

export const register = createAsyncThunk(
  'auth/register',
  async (
    { email, password, name }: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const user = await registerUser(email, password)

      if (!user) {
        return rejectWithValue('Registration failed')
      }

      // save name in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: user.id, name })

      if (profileError) {
        return rejectWithValue(profileError.message)
      }

      return {
        id: user.id,
        email: user.email,
        name,
      }
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const supaUser = await loginUser(email, password)
    if (!supaUser) throw new Error('Login failed')

    let profileName = 'Unknown'
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', supaUser.id)
        .maybeSingle()

      if (!error && profile) profileName = profile.name ?? 'Unknown'
    } catch {
      profileName = 'Unknown'
    }

    return {
      id: supaUser.id,
      email: supaUser.email ?? null,
      name: profileName,
    }
  }
)

export const hydrateUser = createAsyncThunk<AuthUser | null>(
  'auth/hydrate',
  async () => {
    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) return null

    let profileName = 'Unknown'
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .maybeSingle()

      if (!error && profile) profileName = profile.name ?? 'Unknown'
    } catch {
      profileName = 'Unknown'
    }

    return {
      id: user.id,
      email: user.email ?? null,
      name: profileName,
    }
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
      .addCase(register.pending, s => {
        s.loading = true
        s.error = null
      })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false
        s.user = a.payload as AuthUser
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false
        s.error = a.payload as string
      })
      .addCase(login.fulfilled, (s, a) => {
        s.user = a.payload
        s.error = null
      })
      .addCase(login.pending, s => {
        s.loading = true
        s.error = null
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false
        s.error = (a.payload as string) || 'Invalid credentials'
      })
      .addCase(logout.fulfilled, s => {
        s.user = null
        s.error = null
        s.loading = false
        s.hydrated = true 
      })
      .addCase(hydrateUser.pending, s => {
        s.loading = true
      })
      .addCase(hydrateUser.fulfilled, (s, a) => {
        s.user = a.payload
        s.loading = false
        s.hydrated = true
      })
      .addCase(hydrateUser.rejected, s => {
        s.loading = false
        s.hydrated = true
      })
  },
})

export default authSlice.reducer
