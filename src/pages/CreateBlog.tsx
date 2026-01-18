import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { addBlog } from '../features/blog/blogSlice'
import type { AppDispatch, RootState } from '../app/store'

export default function CreateBlog() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const user = useSelector((s: RootState) => s.auth.user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    await dispatch(addBlog({ title, content, userId: user.id }))
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

        <button type="submit">Post</button>
      </form>

      <Link to="/">Back to Blogs</Link>
    </div>
  )
}
