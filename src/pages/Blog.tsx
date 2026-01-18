import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadBlogById, removeBlog } from '../features/blog/blogSlice'
import type { AppDispatch, RootState } from '../app/store'
import Loader from '../components/loader'
import Comments from '../features/comments/Comments'

export default function Blog() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [activeImage, setActiveImage] = useState<string | null>(null)

  const { selectedBlog: blog, loading, error } = useSelector(
    (state: RootState) => state.blog
  )

  const { user, hydrated } = useSelector(
    (state: RootState) => state.auth
  )

  useEffect(() => {
    if (id) {
      dispatch(loadBlogById(id))
    }
  }, [id, dispatch])

  if (!hydrated || loading) {
    return <Loader />
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>
  }

  if (!blog) {
    return <p>Blog not found</p>
  }

  const isOwner = user?.id === blog.author_id
  const images = blog.images ?? []
  const isGallery = images.length > 1

  return (
    <div className="container">
      <div className="header">
        <h2>Blogbook</h2>
        <div>
          <Link to="/profile">{user?.name}</Link>
          <Link to="/logout"><button>Logout</button></Link>
        </div>
      </div>

      <h1>{blog.title}</h1>
      <p>{blog.content}</p>

      {/* ===== BLOG IMAGES ===== */}
      {images.length > 0 && (
        <div
          className={
            isGallery
              ? 'blog-images-grid'
              : 'blog-images-single'
          }
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Blog image ${i + 1}`}
              loading="lazy"
              className={isGallery ? 'clickable' : ''}
              onClick={() => {
                if (isGallery) {
                  setActiveImage(src)
                }
              }}
            />
          ))}
        </div>
      )}

      {/* ===== IMAGE MODAL ===== */}
      {activeImage && (
        <div
          className="image-modal"
          onClick={() => setActiveImage(null)}
        >
          <img
            src={activeImage}
            alt="Full view"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {blog.authorName && (
        <p className="blog-author">
          Author: {blog.authorName}
        </p>
      )}

      {isOwner && (
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

      {/* ===== COMMENTS ===== */}
      <div className="container">
        <Comments blogId={blog.id} />
      </div>

      <Link to="/">Back to Blogs</Link>
    </div>
  )
}
