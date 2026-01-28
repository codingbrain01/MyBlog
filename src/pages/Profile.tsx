import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabaseClient'
import type { RootState } from '../app/store'
import { Link } from 'react-router-dom'

// Profile page component
interface Blog {
  id: string
  title: string
  content: string
  created_at: string
}

// Pagination settings
const PAGE_SIZE = 10

// Profile page component
export default function Profile() {

  // Select user from auth state
  const { user } = useSelector((s: RootState) => s.auth)

  // Local state for user's blogs and pagination
  const [blogs, setBlogs] = useState<Blog[]>([])

  // Pagination state
  const [page, setPage] = useState(1)

  // Total blogs count
  const [total, setTotal] = useState(0)

  // Loading state
  const [loading, setLoading] = useState(false)

  // Fetch user's blogs from Supabase
  if (!user) return null

  // Function to fetch blogs
  const fetchBlogs = async () => {

    // Set loading state
    setLoading(true)

    // Calculate range for pagination
    const from = (page - 1) * PAGE_SIZE

    // Calculate to index for pagination
    const to = from + PAGE_SIZE - 1

    // Query Supabase for user's blogs with pagination
    const { data, count, error } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    // Handle error
    if (error) console.error(error)

    // Update state with fetched blogs
    else {
      setBlogs(data as Blog[])
      setTotal(count || 0)
    }

    // Clear loading state
    setLoading(false)
  }

  // Fetch blogs when page changes
  useEffect(() => {
    fetchBlogs()
  }, [page])

  // Calculate total pages for pagination
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Render profile page
  return (
    <div className="container profile-page">
      <div className="header">
        <h2>My Profile</h2>
        <Link className="a" to="/logout"><button className="logout-btn">Logout</button></Link>
      </div>
      <div className="profile-info">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <h3>My Blogs</h3>

      {loading && <p>Loading blogs...</p>}

      {!loading && blogs.length === 0 && <p>You haven't posted any blogs yet.</p>}

      <ul className="blog-list">

        {/* Render blog list items */}
        {blogs.map(blog => (
          <Link to={`/blog/${blog.id}`} key={blog.id}>
            <li className="blog-item">
              <h4>{blog.title}</h4>
              <p className="content">{blog.content.slice(0, 100)}</p>
            </li>
          </Link>
        ))}
      </ul>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      <Link to="/">Back to Blogs</Link>
    </div>
  )
}
