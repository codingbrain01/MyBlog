import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
} from './blogService'

export interface Blog {
    id: string
    title: string
    content: string
    author_id: string
    created_at: string
}

interface BlogState {
    items: Blog[]
    total: number
    page: number
    pageSize: number
    loading: boolean
    error: string | null
}

const initialState: BlogState = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 5,
    loading: false,
    error: null,
}

export const loadBlogs = createAsyncThunk(
    'blog/load',
    async ({ page, pageSize }: { page: number; pageSize: number }) =>
        fetchBlogs(page, pageSize)
)

export const addBlog = createAsyncThunk(
    'blog/add',
    async (
        { title, content, userId }: { title: string; content: string; userId: string }
    ) => {
        await createBlog(title, content, userId)
    }
)

export const editBlog = createAsyncThunk(
    'blog/edit',
    async ({ id, title, content }: { id: string; title: string; content: string }) => {
        await updateBlog(id, title, content)
    }
)

export const removeBlog = createAsyncThunk(
    'blog/remove',
    async (id: string) => {
        await deleteBlog(id)
    }
)

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadBlogs.pending, s => { s.loading = true })
            .addCase(loadBlogs.fulfilled, (s, a) => {
                s.loading = false
                s.items = a.payload.data
                s.total = a.payload.count || 0
            })
            .addCase(loadBlogs.rejected, (s, a) => {
                s.loading = false
                s.error = a.error.message || 'Failed to load blogs'
            })
            .addCase(removeBlog.fulfilled, s => {
                s.items = s.items.filter(b => b.id !== s.items[0]?.id)
            })
            .addCase(addBlog.rejected, (s, a) => {
                s.error = a.error.message || 'Failed to create blog'
            })
            .addCase(editBlog.rejected, (s, a) => {
                s.error = a.error.message || 'Failed to update blog'
            })
            .addCase(removeBlog.rejected, (s, a) => {
                s.error = a.error.message || 'Failed to delete blog'
            })


    },
})

export const { setPage } = blogSlice.actions
export default blogSlice.reducer
