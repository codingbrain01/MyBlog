import { supabase } from '../../lib/supabaseClient'

export const fetchBlogs = async (page: number, pageSize: number) => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await supabase
    .from('blogs')
    .select('*, profiles(name)', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Map profiles.name → author_name
  const blogs = (data || []).map(blog => ({
    ...blog,
    author_name: blog.profiles?.name ?? 'Unknown'
  }))

  return { data: blogs, count }
}


export const fetchBlogById = async (id: string) => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*, profiles(name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
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
