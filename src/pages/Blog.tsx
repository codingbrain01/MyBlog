import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadBlogById, removeBlog } from '../features/blog/blogSlice'
import type { AppDispatch, RootState } from '../app/store'
import Loader from '../components/loader'
import Comments from '../features/comments/Comments'

// Blog page component
export default function Blog() {
  // Get blog ID from URL params
  const { id } = useParams<{ id: string }>()

  // Redux hooks
  const dispatch = useDispatch<AppDispatch>()

  // Navigation hook
  const navigate = useNavigate()

  // Local state for active image in modal
  const [activeImage, setActiveImage] = useState<string | null>(null)

  // Select blog state from Redux store
  const { selectedBlog: blog, loading, error } = useSelector(
    (state: RootState) => state.blog
  )

  // Select auth state from Redux store
  const { user, hydrated } = useSelector(
    (state: RootState) => state.auth
  )

  // Load blog on component mount or when ID changes
  useEffect(() => {
    // Dispatch loadBlogById action
    if (id) {
      dispatch(loadBlogById(id))
    }
  }, [id, dispatch])

  // Render loading, error, or blog content
  if (!hydrated || loading) {

    // Show loader while session is hydrating or blog is loading
    return <Loader />
  }

  // Show error message if loading failed
  if (error) {

    // Display error
    return <p style={{ color: 'red' }}>{error}</p>
  }

  // Show message if blog not found
  if (!blog) {

    // Display not found message
    return <p>Blog not found</p>
  }

  // Check if current user is the blog owner
  const isOwner = user?.id === blog.author_id

  // Extract images and determine if gallery
  const images = blog.images ?? []

  // Determine if multiple images for gallery layout
  const isGallery = images.length > 1

  // Render blog content
  return (
    <div className="container">
      <div className="header">
        <h2>Blogbook</h2>
        <div>
          <Link to="/profile">{user?.name}</Link>
          <Link className="a" to="/logout"><button>Logout</button></Link>
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
            onClick={async () => {
              if (confirm('Delete this blog?')) {
                try {
                  // Pass both id and images to delete associated images from storage
                  await dispatch(removeBlog({
                    id: blog.id,
                    images: blog.images
                  })).unwrap()
                  navigate('/')
                } catch (error) {
                  console.error('Error deleting blog:', error)
                  alert('Failed to delete blog. Please try again.')
                }
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
