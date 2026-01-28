import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchComments, createComment, updateComment, deleteComment } from './commentService'
import type { Comment } from './commentService'

interface CommentState {
    items: Comment[]
    loading: boolean
    error: string | null
}

const initialState: CommentState = {
    items: [],
    loading: false,
    error: null,
}

// Load comments for a blog
export const loadComments = createAsyncThunk(
    'comments/load',
    async (blogId: string, { rejectWithValue }) => {
        try {
            return await fetchComments(blogId)
        } catch (err: any) {
            return rejectWithValue(err.message)
        }
    }
)

// Add a comment or reply
export const addComment = createAsyncThunk(
    'comments/add',
    async (
        { blogId, authorId, content, parentId, images }:
            { blogId: string, authorId: string, content: string, parentId?: string, images?: string[] },
        { rejectWithValue }
    ) => {
        try {
            await createComment(blogId, authorId, content, parentId, images)
        } catch (err: any) {
            return rejectWithValue(err.message)
        }
    }
)

export const editComment = createAsyncThunk(
    'comments/edit',
    async (
        { id, content, images }: { id: string; content: string; images?: string[] },
        { rejectWithValue }
    ) => {
        try {
            await updateComment(id, content, images)
            return { id, content, images }
        } catch (err: any) {
            return rejectWithValue(err.message)
        }
    }
)

// Delete comment
export const removeComment = createAsyncThunk(
    'comments/remove',
    async (id: string, { rejectWithValue }) => {
        try {
            await deleteComment(id)
            return id
        } catch (err: any) {
            return rejectWithValue(err.message)
        }
    }
)

const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(loadComments.pending, state => { state.loading = true })
            .addCase(loadComments.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload
            })
            .addCase(loadComments.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            .addCase(addComment.pending, state => { state.loading = true })
            .addCase(addComment.fulfilled, state => { state.loading = false })
            .addCase(addComment.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            
            // CHANGED: Set loading state during edit
            .addCase(editComment.pending, state => { 
                state.loading = true 
            })
            .addCase(editComment.fulfilled, state => {
                // Don't update local state here - we'll reload from DB instead
                state.loading = false
            })
            .addCase(editComment.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            
            .addCase(removeComment.fulfilled, (state, action) => {
                if (action.payload) {
                    state.items = state.items.filter(c => c.id !== action.payload)
                }
            })

            .addCase(removeComment.rejected, (state, action) => {
                state.error = action.payload as string
            })
    }
})

export default commentSlice.reducer