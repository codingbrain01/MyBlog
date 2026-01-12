import { supabase } from '../../lib/supabaseClient'

export const fetchBlogs = async (page: number, pageSize: number) => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('blogs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { data, count }
}

export const createBlog = async (title: string, content: string, userId: string) => {
  const { error } = await supabase.from('blogs').insert({
    title,
    content,
    author_id: userId,
  })
  if (error) throw error
}

export const updateBlog = async (id: string, title: string, content: string) => {
  const { error } = await supabase
    .from('blogs')
    .update({ title, content, updated_at: new Date() })
    .eq('id', id)
  if (error) throw error
}

export const deleteBlog = async (id: string) => {
  const { error } = await supabase.from('blogs').delete().eq('id', id)
  if (error) throw error
}
