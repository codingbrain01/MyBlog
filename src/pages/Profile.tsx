import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabaseClient'
import type { RootState } from '../app/store'
import { Link } from 'react-router-dom'

interface Blog {
  id: string
  title: string
  content: string
  created_at: string
}

const PAGE_SIZE = 5

export default function Profile() {
  const { user } = useSelector((s: RootState) => s.auth)
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  if (!user) return null  // PrivateRoute should handle auth

  const fetchBlogs = async () => {
    setLoading(true)
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count, error } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) console.error(error)
    else {
      setBlogs(data as Blog[])
      setTotal(count || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBlogs()
  }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="container profile-page">
      <h2>My Profile</h2>
      <div className="profile-info">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <h3>My Blogs</h3>

      {loading && <p>Loading blogs...</p>}

      {!loading && blogs.length === 0 && <p>You haven't posted any blogs yet.</p>}

      <ul className="blog-list">
        {blogs.map(blog => (
          <li key={blog.id} className="blog-item">
            <Link to={`/blog/${blog.id}`}>{blog.title}</Link> 
            <p>{blog.content.slice(0, 100)}</p>
          </li>
        ))}
      </ul>

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
