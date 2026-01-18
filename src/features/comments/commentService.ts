import { supabase } from '../../lib/supabaseClient'

export interface Comment {
  id: string
  blog_id: string
  author_id: string
  content: string
  parent_id?: string | null
  created_at: string
  author_name?: string | null
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
export const createComment = async (blogId: string, authorId: string, content: string, parentId?: string) => {
  const { error } = await supabase.from('comments').insert({
    blog_id: blogId,
    author_id: authorId,
    content,
    parent_id: parentId || null
  })

  if (error) throw error
}

// Delete a comment
export const deleteComment = async (id: string) => {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}
