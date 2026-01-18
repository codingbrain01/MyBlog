import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    fetchBlogs,
    fetchBlogById,
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
    authorName: string | null
    images?: string[]
}

interface BlogState {
    items: Blog[]
    selectedBlog: Blog | null
    total: number
    page: number
    pageSize: number
    loading: boolean
    error: string | null
}

const initialState: BlogState = {
    items: [],
    selectedBlog: null,
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
    error: null,
}

export const loadBlogs = createAsyncThunk(
    'blog/load',
    async ({ page, pageSize }: { page: number; pageSize: number }) =>
        fetchBlogs(page, pageSize)
)

export const loadBlogById = createAsyncThunk(
    'blog/loadById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await fetchBlogById(id)
        } catch (err: any) {
            return rejectWithValue(err.message)
        }
    }
)
export const addBlog = createAsyncThunk(
    'blog/add',
    async (
        { title, content, userId, images }: { title: string; content: string; userId: string, images?: string[] }
    ) => {
        await createBlog(title, content, userId, images)
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
            .addCase(loadBlogById.pending, s => { s.loading = true })
            .addCase(loadBlogById.fulfilled, (s, a) => {
                s.selectedBlog = a.payload
                s.loading = false
            })
            .addCase(loadBlogById.rejected, (s, a) => {
                s.error = a.payload as string
                s.loading = false
            })
            .addCase(removeBlog.fulfilled, (s, action) => {
                const idToRemove = action.meta.arg
                s.items = s.items.filter(b => b.id !== idToRemove)
                if (s.selectedBlog?.id === idToRemove) {
                    s.selectedBlog = null
                }
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
