import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, Link } from 'react-router-dom'
import type { RootState, AppDispatch } from '../app/store'
import { editBlog } from '../features/blog/blogSlice'
import { uploadBlogImages } from '../features/blog/blogService'

export default function EditBlog() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const blog = useSelector((s: RootState) =>
    s.blog.items.find(b => b.id === id)
  )
  const user = useSelector((s: RootState) => s.auth.user)

  const [title, setTitle] = useState(blog?.title || '')
  const [content, setContent] = useState(blog?.content || '')

  // ✅ EXISTING IMAGES (URLs from DB)
  const [existingImages, setExistingImages] = useState<string[]>(() => {
    if (!blog?.images) return []
    if (Array.isArray(blog.images)) return blog.images
    try {
      return JSON.parse(blog.images)
    } catch {
      return []
    }
  })

  // ✅ NEWLY SELECTED FILES
  const [newImages, setNewImages] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  // Generate previews for new images
  useEffect(() => {
    const urls = newImages.map(file => URL.createObjectURL(file))
    setNewPreviews(urls)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [newImages])

  useEffect(() => {
    if (!blog || blog.author_id !== user?.id) {
      navigate('/')
    }
  }, [blog, user, navigate])

  if (!blog) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let imageUrls = [...existingImages]

    if (newImages.length > 0 && user) {
      const uploaded = await uploadBlogImages(newImages, user.id)
      imageUrls = [...imageUrls, ...uploaded]
    }

    await dispatch(editBlog({
      id: blog.id,
      title,
      content,
      images: imageUrls,
    }))

    navigate('/')
  }

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

        {/* IMAGE PREVIEW | Existing and New) */}
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
                  type="button"
                  onClick={() =>
                    setExistingImages(imgs => imgs.filter((_, idx) => idx !== i))
                  }
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '.5px',
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
