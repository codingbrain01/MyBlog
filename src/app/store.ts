import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import blogReducer from '../features/blog/blogSlice'
import commentReducer from '../features/comments/commentSlice'

// Configure Redux store with auth, blog, and comments slices
export const store = configureStore({
  
  // Combine reducers
  reducer: {
    auth: authReducer,
    blog: blogReducer,
    comments: commentReducer,
  },
})

// Define RootState and AppDispatch types
// Export RootState type
export type RootState = ReturnType<typeof store.getState>

// Export AppDispatch type
export type AppDispatch = typeof store.dispatch