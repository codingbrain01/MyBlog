import { supabase } from '../../lib/supabaseClient'

export interface Comment {
  id: string
  blog_id: string
  author_id: string
  content: string
  parent_id?: string | null
  created_at: string
  author_name?: string | null
  images?: string[]
}

// Fetch comments for a blog (including replies)
export const fetchComments = async (blogId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(name)')
    .eq('blog_id', blogId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data || []).map(c => ({
    ...c,
    author_name: c.profiles?.name ?? 'Unknown'
  }))
}

// Create a new comment or reply
export const createComment = async (blogId: string,
  authorId: string,
  content: string,
  parentId?: string,
  images?: string[]
) => {
  const { error } = await supabase.from('comments').insert({
    blog_id: blogId,
    author_id: authorId,
    content,
    parent_id: parentId || null,
    images: images || null
  })

  if (error) throw error
}

// Update a comment or reply (now supports images)
export const updateComment = async (id: string, content: string, images?: string[]) => {
  const updateData: any = { content }
  
  if (images !== undefined) {
    updateData.images = images && images.length > 0 ? images : null
  }
  
  const { data, error } = await supabase
    .from('comments')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) throw error
  
  if (!data || data.length === 0) {
    throw new Error('Update did not affect any rows')
  }
}

// Delete a comment
export const deleteComment = async (id: string) => {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}
