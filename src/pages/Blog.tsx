import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadBlogById, removeBlog } from '../features/blog/blogSlice'
import type { AppDispatch, RootState } from '../app/store'
import Loader from '../components/loader'

export default function Blog() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { selectedBlog: blog, loading, error } = useSelector(
    (s: RootState) => s.blog
  )
  const { user, hydrated } = useSelector((s: RootState) => s.auth)

  useEffect(() => {
    if (id) {
      dispatch(loadBlogById(id))
    }
  }, [id, dispatch])
  
  if (!hydrated || loading) return <Loader />

  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!blog) return <p>Blog not found</p>

  return (
    <div className="container">
      <h1>{blog.title}</h1>
      <p>{blog.content}</p>

      {user && user.id === blog.author_id && (
        <div className="blog-actions">
          <Link to={`/edit/${blog.id}`}>
            <p className="btn-edit">Edit</p>
          </Link>
          <p
            className="btn-danger"
            onClick={() => {
              if (confirm('Delete this blog?')) {
                dispatch(removeBlog(blog.id))
                navigate('/')
              }
            }}
          >
            Delete
          </p>
        </div>
      )}

      <Link to="/">Back to Blogs</Link>
    </div>
  )
}
