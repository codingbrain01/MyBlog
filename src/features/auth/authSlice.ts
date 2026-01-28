import { supabase } from '../../lib/supabaseClient'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { registerUser, loginUser, logoutUser } from './authService'

// Define AuthUser and AuthState interfaces
interface AuthUser {
  id: string
  email: string | null
  name?: string
}

// Define initial state
interface AuthState {
  user: AuthUser | null
  loading: boolean
  hydrated: boolean
  error: string | null
}

// Initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  hydrated: false,
  error: null,
}

// Register new user
export const register = createAsyncThunk(
  'auth/register',

  // Return AuthUser after registration
  async (
    { email, password, name }: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {

      // Register user with Supabase Auth
      const user = await registerUser(email, password)

      // Handle registration failure
      if (!user) {
        return rejectWithValue('Registration failed')
      }

      // save name in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: user.id, name })

      // Handle profile error
      if (profileError) {
        return rejectWithValue(profileError.message)
      }

      // Return AuthUser
      return {
        id: user.id,
        email: user.email,
        name,
      }
    } catch (err: any) {

      // Handle unexpected errors
      return rejectWithValue(err.message)
    }
  }
)

// Login existing user
export const login = createAsyncThunk(
  'auth/login',

  // Return AuthUser after login  
  async ({ email, password }: { email: string; password: string }) => {

    // Login user with Supabase Auth
    const supaUser = await loginUser(email, password)

    // Handle login failure
    if (!supaUser) throw new Error('Login failed')

    // Default name
    let profileName = 'Unknown'

    // Fetch profile name
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', supaUser.id)
        .maybeSingle()

      // Set profile name if exists
      if (!error && profile) profileName = profile.name ?? 'Unknown'
    } catch {

      // Set default name on error
      profileName = 'Unknown'
    }

    // Return AuthUser
    return {
      id: supaUser.id,
      email: supaUser.email ?? null,
      name: profileName,
    }
  }
)

// Hydrate user on app start
export const hydrateUser = createAsyncThunk<AuthUser | null>(
  'auth/hydrate',

  // Return AuthUser or null if not logged in
  async () => {
    
    // Get current user from Supabase auth
    const { data } = await supabase.auth.getUser()
    const user = data.user

    // If no user, return null
    if (!user) return null

    // Default name 
    let profileName = 'Unknown'

    // Fetch profile name
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .maybeSingle()

      // Set profile name if exists
      if (!error && profile) profileName = profile.name ?? 'Unknown'
    } catch {
      
      // Set default name on error
      profileName = 'Unknown'
    }

    // Return AuthUser
    return {
      id: user.id,
      email: user.email ?? null,
      name: profileName,
    }
  }
)

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutUser()
})

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder

      // Register
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

      // Login
      .addCase(login.pending, s => {
        s.loading = true
        s.error = null
      })
      .addCase(login.fulfilled, (s, a) => {
        s.user = a.payload
        s.error = null
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false
        s.error = (a.payload as string) || 'Invalid credentials'
      })

      // Logout
      .addCase(logout.pending, s => {
        s.loading = true
      })
      .addCase(logout.fulfilled, s => {
        s.user = null
        s.error = null
        s.loading = false
        s.hydrated = true
      })
      .addCase(logout.rejected, s => {
        s.loading = false
      })
      
      // Hydrate User
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

// Export the reducer
export default authSlice.reducer
