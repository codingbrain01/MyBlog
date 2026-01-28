import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { uploadBlogImages } from '../features/blog/blogService'
import { addBlog } from '../features/blog/blogSlice'
import type { AppDispatch, RootState } from '../app/store'

// CreateBlog page component
export default function CreateBlog() {

  // Local state for form inputs and image previews
  const [title, setTitle] = useState('')

  // Local state for form inputs and image previews
  const [content, setContent] = useState('')

  // Local state for selected image files
  const [images, setImages] = useState<File[]>([])

  // Local state for image preview URLs
  const [previews, setPreviews] = useState<string[]>([])

  // Redux hooks
  const dispatch = useDispatch<AppDispatch>()

  // Navigation hook
  const navigate = useNavigate()

  // Select user from auth state
  const user = useSelector((s: RootState) => s.auth.user)

  // Generate previews whenever images changes
  useEffect(() => {

    // Create object URLs for image previews
    const urls = images.map(file => URL.createObjectURL(file))
    setPreviews(urls)

    // Revoke object URLs on cleanup to avoid memory leaks
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [images])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {

    // Prevent default form submission behavior
    e.preventDefault()

    // Ensure user is logged in
    if (!user) return

    // Upload images if any and get their URLs
    let imageUrls: string[] | undefined = undefined

    // Upload images if any are selected
    if (images.length > 0) {

      // Upload images and get their URLs
      imageUrls = await uploadBlogImages(images, user.id)
    }

    // Dispatch addBlog action to create new blog
    await dispatch(addBlog({ title, content, userId: user.id, images: imageUrls, }))

    // Navigate back to blogs list after creation
    navigate('/')
  }

  // Render CreateBlog page
  return (
    <div className='container'>
      <form onSubmit={handleSubmit}>
        <h2>Create Blog</h2>

        <input
          placeholder="Title"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Content"
          required
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ resize: 'none' }}
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => {
            if (!e.target.files) return
            setImages(Array.from(e.target.files))
          }}
        />

        {/* Image Preview */}
        {previews.length > 0 && (
          <div className="image-previews">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Preview ${i}`}
                style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }}
              />
            ))}
          </div>
        )}

        <button className="btn-create" type="submit">Post</button>
      </form>

      <Link to="/">Back to Blogs</Link>
    </div>
  )
}
