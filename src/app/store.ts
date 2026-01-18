import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import blogReducer from '../features/blog/blogSlice'
import commentReducer from '../features/comments/commentSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    blog: blogReducer,
    comments: commentReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch