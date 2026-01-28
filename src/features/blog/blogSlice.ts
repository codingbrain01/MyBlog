import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    fetchBlogs,
    fetchBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
} from './blogService'

// Define Blog interface
export interface Blog {
    id: string
    title: string
    content: string
    author_id: string
    created_at: string
    authorName: string | null
    images?: string[]
}

// Define BlogState interface
interface BlogState {
    items: Blog[]
    selectedBlog: Blog | null
    total: number
    page: number
    pageSize: number
    loading: boolean
    error: string | null
}

// Initial state
const initialState: BlogState = {
    items: [],
    selectedBlog: null,
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
    error: null,
}

// Thunks for loading, adding, editing, and removing blogs
export const loadBlogs = createAsyncThunk(
    'blog/load',

    // Fetch blogs with pagination
    async ({ page, pageSize }: { page: number; pageSize: number }) =>
        fetchBlogs(page, pageSize)
)

// Load a single blog by ID
export const loadBlogById = createAsyncThunk(
    'blog/loadById',

    // Fetch blog by ID
    async (id: string, { rejectWithValue }) => {
        try {
            return await fetchBlogById(id)
        } catch (err: any) {
            return rejectWithValue(err.message)
        }
    }
)

// Add a new blog
export const addBlog = createAsyncThunk(
    'blog/add',

    // Create a new blog
    async (
        { title, content, userId, images }: { title: string; content: string; userId: string, images?: string[] }
    ) => {
        await createBlog(title, content, userId, images)
    }
)

// Edit an existing blog
export const editBlog = createAsyncThunk(
    'blog/edit',

    // Update a blog
    async ({ id, title, content, images }: { id: string; title: string; content: string; images?: string[] }
    ) => {
        await updateBlog(id, title, content, images)
    }
)

// Remove a blog
export const removeBlog = createAsyncThunk(
    'blog/remove',

    // Delete blog by ID
    async ({ id, images }: { id: string; images?: string[] }) => {
        await deleteBlog(id, images)
        return id
    }
)

// Create blog slice
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

            // Load blogs
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

            // Load blog by ID
            .addCase(loadBlogById.pending, s => { s.loading = true })
            .addCase(loadBlogById.fulfilled, (s, a) => {
                s.selectedBlog = a.payload
                s.loading = false
            })
            .addCase(loadBlogById.rejected, (s, a) => {
                s.error = a.payload as string
                s.loading = false
            })


            // Add blog
            .addCase(addBlog.pending, s => {
                s.loading = true
            })
            .addCase(addBlog.fulfilled, s => {
                s.error = null
            })
            .addCase(addBlog.rejected, (s, a) => {
                s.error = a.error.message || 'Failed to create blog'
            })

            // Edit blog
            .addCase(editBlog.pending, s => {
                s.loading = true
            })
            .addCase(editBlog.fulfilled, s => {
                s.error = null
            })
            .addCase(editBlog.rejected, (s, a) => {
                s.error = a.error.message || 'Failed to update blog'
            })

            // Remove blog
            .addCase(removeBlog.pending, s => {
                s.loading = true
            })
            .addCase(removeBlog.fulfilled, (s, a) => {
                s.items = s.items.filter(blog => blog.id !== a.payload)
                s.error = null
            })
            .addCase(removeBlog.rejected, (s, a) => {
                s.error = a.error.message || 'Failed to delete blog'
            })


    },
})

// Export actions and reducer
export const { setPage } = blogSlice.actions
export default blogSlice.reducer
