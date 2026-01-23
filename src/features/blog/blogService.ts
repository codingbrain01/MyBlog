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

  let images: string[] = []

  if (data.images) {
    if (Array.isArray(data.images)) {
      images = data.images
    } else if (typeof data.images === 'string') {
      try {
        images = JSON.parse(data.images)
      } catch {
        images = []
      }
    }
  }

  return {
    ...data,
    authorName: data.profiles?.name ?? null,
    images,
  }
}


export const createBlog = async (title: string, content: string, userId: string, images?: string[]) => {
  const { error } = await supabase.from('blogs').insert({
    title,
    content,
    author_id: userId,
    images,
  })
  if (error) throw error
}

export const updateBlog = async (id: string, title: string, content: string, images?: string[]) => {

  const payload: any = {
    title,
    content,
    updated_at: new Date(),
  }

  if (images) {
    payload.images = images
  }

  const { error } = await supabase
    .from('blogs')
    .update({ title, content, images, updated_at: new Date() })
    .eq('id', id)

  if (error) throw error
}

export const uploadBlogImages = async (files: File[], userId: string) => {
  const uploadedUrls: string[] = []

  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file)

    if (error) throw error

    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName)

    if (!data?.publicUrl) throw new Error('Failed to get public URL')

    console.log('Uploaded URL:', data.publicUrl)

    uploadedUrls.push(data.publicUrl)
  }

  return uploadedUrls
}

export const deleteBlog = async (id: string) => {
  const { error } = await supabase.from('blogs').delete().eq('id', id)
  if (error) throw error
}
