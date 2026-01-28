import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, Link } from 'react-router-dom'
import type { RootState, AppDispatch } from '../app/store'
import { editBlog } from '../features/blog/blogSlice'
import { uploadBlogImages, deleteBlogImages } from '../features/blog/blogService'

// EditBlog page component
export default function EditBlog() {

  // Get blog ID from URL params
  const { id } = useParams<{ id: string }>()

  // Redux hooks
  const dispatch = useDispatch<AppDispatch>()

  // Navigation hook
  const navigate = useNavigate()

  // Select blog and auth state from Redux store
  const blog = useSelector((s: RootState) =>

    // Find the blog by ID
    s.blog.items.find(b => b.id === id)
  )

  // Select user from auth state
  const user = useSelector((s: RootState) => s.auth.user)

  // FORM STATE
  const [title, setTitle] = useState(blog?.title || '')

  // Content state
  const [content, setContent] = useState(blog?.content || '')

  // EXISTING IMAGES (URLs from DB)
  const [existingImages, setExistingImages] = useState<string[]>(() => {

    // Parse images from blog
    if (!blog?.images) return []

    // Return as array
    if (Array.isArray(blog.images)) return blog.images

    // Handle JSON string
    try {
      return JSON.parse(blog.images)
    } catch {
      return []
    }
  })

  // TRACK REMOVED IMAGES for deletion
  const [removedImages, setRemovedImages] = useState<string[]>([])

  // NEWLY SELECTED FILES
  const [newImages, setNewImages] = useState<File[]>([])

  // Previews for new images
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  // Generate previews for new images
  useEffect(() => {

    // Create object URLs for image previews
    const urls = newImages.map(file => URL.createObjectURL(file))

    // Set previews state
    setNewPreviews(urls)

    // Revoke object URLs on cleanup to avoid memory leaks
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [newImages])

  // Redirect if blog not found or user is not the owner
  useEffect(() => {

    // Navigate to home if no blog or not owner
    if (!blog || blog.author_id !== user?.id) {
      navigate('/')
    }
  }, [blog, user, navigate])

  // Return null if blog is not found
  if (!blog) return null

  // Handle removing existing images
  const handleRemoveExistingImage = (index: number) => {

    // Get the image URL to remove
    const imageToRemove = existingImages[index]

    // Update removed images and existing images state
    setRemovedImages(prev => [...prev, imageToRemove])

    // Update existing images state
    setExistingImages(imgs => imgs.filter((_, idx) => idx !== index))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {

    // Prevent default form submission behavior
    e.preventDefault()

    try {
      // Delete removed images from storage
      if (removedImages.length > 0) {
        await deleteBlogImages(removedImages)
      }

      // Start with existing images (ones that weren't removed)
      let imageUrls = [...existingImages]

      // Upload new images if any
      if (newImages.length > 0 && user) {

        // Upload new images and get their URLs
        const uploaded = await uploadBlogImages(newImages, user.id)
        imageUrls = [...imageUrls, ...uploaded]
      }

      // Update the blog with new image array
      await dispatch(editBlog({
        id: blog.id,
        title,
        content,
        images: imageUrls,
      }))

      navigate('/')
    } catch (error) {

      // Log and alert error
      console.error('Error updating blog:', error)
      alert('Failed to update blog. Please try again.')
    }
  }

  // Render EditBlog page
  return (
    <div className="container">
      <h2>Edit Blog</h2>

      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          style={{ resize: 'none' }}
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => {
            if (!e.target.files) return
            setNewImages(Array.from(e.target.files))
          }}
        />

        {/* IMAGE PREVIEW (Existing and New) */}
        {(existingImages.length > 0 || newPreviews.length > 0) && (
          <div className="image-previews" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

            {/* Existing images with remove button */}
            {existingImages.map((src, i) => (
              <div key={`existing-${i}`} style={{ position: 'relative' }}>
                <img
                  src={src}
                  alt={`Existing ${i}`}
                  style={{
                    maxWidth: '150px',
                    maxHeight: '150px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />

                <button
                className="btn-remove-image"
                  type="button"
                  onClick={() => handleRemoveExistingImage(i)}
                >
                  ×
                </button>
              </div>
            ))}

            {/* Newly selected images */}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} style={{ position: 'relative' }}>
                <img
                  src={src}
                  alt={`New ${i}`}
                  style={{
                    maxWidth: '150px',
                    maxHeight: '150px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setNewImages(files => files.filter((_, idx) => idx !== i))
                  }
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" style={{ marginTop: '12px' }}>Update</button>
      </form>

      <Link to="/" style={{ display: 'block', marginTop: '16px' }}>Back to Blogs</Link>
    </div>
  )
}