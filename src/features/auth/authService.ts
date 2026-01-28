import { supabase } from '../../lib/supabaseClient'

// Register user with Supabase Auth
export const registerUser = async (email: string, password: string) => {

  // Create new user
  const { data, error } = await supabase.auth.signUp({ email, password })

  // Handle error
  if (error) throw error

  // Return user
  return data.user
}

// Login user with Supabase Auth
export const loginUser = async (email: string, password: string) => {

  // Sign in existing user
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Handle error
  if (error) throw error

  // Return user
  return data.user
}

// Logout user from Supabase Auth
export const logoutUser = async () => {

  // Sign out user
  const { error } = await supabase.auth.signOut()

  // Handle error
  if (error) throw error
}
