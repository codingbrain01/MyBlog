import { supabase } from '../../lib/supabaseClient'

// Fetch paginated list of blogs with author names
export const fetchBlogs = async (page: number, pageSize: number) => {

  // Calculate range for pagination
  const from = (page - 1) * pageSize

  // Calculate to index
  const to = from + pageSize - 1

  // Fetch blogs with author profiles
  const { data, count, error } = await supabase
    .from('blogs')
    .select('*, profiles(name)', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  // Handle error
  if (error) throw error

  // Map profiles.name → author_name
  const blogs = (data || []).map(blog => ({
    ...blog,
    author_name: blog.profiles?.name ?? 'Unknown'
  }))

  // Return blogs and total count
  return { data: blogs, count }
}

// Fetch a single blog by ID with author name
export const fetchBlogById = async (id: string) => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*, profiles(name)')
    .eq('id', id)
    .single()

  // Handle error
  if (error) throw error

  // Parse images field
  let images: string[] = []

  // Handle images stored as JSON string or array
  if (data.images) {

    // Check if images is already an array
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

  // Return blog with authorName and images
  return {
    ...data,
    authorName: data.profiles?.name ?? null,
    images,
  }
}

// Create a new blog post
export const createBlog = async (title: string, content: string, userId: string, images?: string[]) => {

  // Insert new blog into 'blogs' table
  const { error } = await supabase.from('blogs').insert({
    title,
    content,
    author_id: userId,
    images,
  })
  // Handle error
  if (error) throw error
}

// Update an existing blog post
export const updateBlog = async (id: string, title: string, content: string, images?: string[]) => {
  // Prepare payload for update
  const payload: any = {
    title,
    content,
    updated_at: new Date(),
  }

  // Include images if provided
  if (images) {
    payload.images = images
  }

  // Update blog in 'blogs' table
  const { error } = await supabase
    .from('blogs')
    .update({ title, content, images, updated_at: new Date() })
    .eq('id', id)

  // Handle error
  if (error) throw error
}

// Upload blog images to Supabase storage 
export const uploadBlogImages = async (files: File[], userId: string) => {

  // Array to hold uploaded image URLs
  const uploadedUrls: string[] = []

  // Upload each file
  for (const file of files) {

    // Generate unique file name
    const fileExt = file.name.split('.').pop()

    // Create file name with userId and UUID
    const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`

    // Upload file to 'blog-images' storage bucket
    const { error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file)

    // Handle error
    if (error) throw error

    // Get public URL of uploaded file
    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName)

    // Handle missing public URL
    if (!data?.publicUrl) throw new Error('Failed to get public URL')

    // Add public URL to array
    uploadedUrls.push(data.publicUrl)
  }

  // Return array of uploaded image URLs
  return uploadedUrls
}

// Delete a blog post by ID
export const deleteBlog = async (id: string, images?: string[]) => {
  try {
    // Fetch * comments/replies to get images
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('images')
      .eq('blog_id', id)

    if (commentsError) throw commentsError

    // Collect all image URLs from comments
    const commentImages: string[] = []
    if (comments) {
      comments.forEach(comment => {
        if (comment.images && Array.isArray(comment.images)) {
          commentImages.push(...comment.images)
        }
      })
    }

    // Delete comment images from storage
    if (commentImages.length > 0) {
      await deleteBlogImages(commentImages)
    }

    // Delete blog images from storage
    if (images && images.length > 0) {
      await deleteBlogImages(images)
    }

    // Delete the blog from database
    const { error } = await supabase.from('blogs').delete().eq('id', id)
    if (error) throw error

  } catch (err) {
    console.error('Failed to delete blog:', err)
    throw err
  }
}

// Function to delete images from Supabase storage
export const deleteBlogImages = async (imageUrls: string[]) => {

  // Return early if no images to delete
  if (!imageUrls || imageUrls.length === 0) return

  // Extract file paths from URLs and delete images
  try {

    // Map URLs to file paths
    const filePaths = imageUrls.map(url => {

      // Extract file path from URL
      const parts = url.split('/blog-images/')
      if (parts.length > 1) {
        return parts[1]
      }

      // If URL format is unexpected,
      return null
    }).filter(Boolean) as string[]

    // Return early if no valid file paths
    if (filePaths.length === 0) return

    // Delete files from 'blog-images' storage bucket
    const { data, error } = await supabase.storage
      .from('blog-images')
      .remove(filePaths)

    // Handle error
    if (error) throw error

    return data
  } catch (err) {

    // Log and rethrow error
    console.error('Failed to delete images:', err)
    throw err
  }
}