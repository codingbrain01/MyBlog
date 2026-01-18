import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { uploadBlogImages } from '../features/blog/blogService'
import { addBlog } from '../features/blog/blogSlice'
import type { AppDispatch, RootState } from '../app/store'

export default function CreateBlog() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const user = useSelector((s: RootState) => s.auth.user)

  // Generate previews whenever `images` changes
  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file))
    setPreviews(urls)

    // Revoke object URLs on cleanup to avoid memory leaks
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [images])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    let imageUrls: string[] | undefined = undefined

    if (images.length > 0) {
      imageUrls = await uploadBlogImages(images, user.id)
    }

    await dispatch(addBlog({ title, content, userId: user.id, images: imageUrls, }))
    navigate('/')
  }

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

        <button type="submit">Post</button>
      </form>

      <Link to="/">Back to Blogs</Link>
    </div>
  )
}
