import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState, AppDispatch } from '../app/store'
import { loadBlogs, setPage } from '../features/blog/blogSlice'

// Blogs page component
export default function Blogs() {

    // Redux hooks
    const dispatch = useDispatch<AppDispatch>()

    // Select blog and auth state from Redux store
    const { items, total, page, pageSize, loading } = useSelector(
        // Select blog state
        (s: RootState) => s.blog
    )

    // Select user from auth state
    const user = useSelector((s: RootState) => s.auth.user)

    // Load blogs when page or pageSize changes
    useEffect(() => {
        // Dispatch loadBlogs action
        dispatch(loadBlogs({ page, pageSize }))
    }, [dispatch, page, pageSize])

    // Calculate total pages for pagination
    const totalPages = Math.ceil(total / pageSize)

    // Select error from blog state
    const { error } = useSelector((s: RootState) => s.blog)

    // Render blogs page
    { error && <p style={{ color: 'red' }}>{error}</p> }

    // Render blogs list with pagination
    return (
        <div className='container'>
            <div className="header">
                <h2>Blogbook</h2>
                <div>
                    <Link to="/profile">{user?.name}</Link>
                    <Link className="a" to="/logout"><button className="logout-btn">Logout</button></Link>
                </div>
            </div>
            <Link to="/create"><button className="btn-create">Create Blog</button></Link>

            {/* Display loading message */}
            {loading && <p>Loading...</p>}

            {/* Display loading message */}
            {!loading && items.length === 0 && (
                <p>No blogs yet. Create the first one.</p>
            )}

            {/* Display list of blogs */}
            {!loading &&

                items.map(blog => (
                    <Link to={`/blog/${blog.id}`} key={blog.id}>
                        <div className='blog-card'>
                            <h3>{blog.title}</h3>
                            <p className="content">{blog.content.slice(0, 100)}</p>
                        </div>
                    </Link>
                ))}

            {/* Pagination */}
            <div className='pagination'>
                <button

                    disabled={page === 1}
                    onClick={() => dispatch(setPage(page - 1))}
                >
                    Prev
                </button>

                <span style={{ margin: '0 1rem' }}>
                    Page {page} of {totalPages || 1}
                </span>

                <button className="btn-next"
                    disabled={page === totalPages}
                    onClick={() => dispatch(setPage(page + 1))}
                >
                    Next
                </button>
            </div>
        </div>
    )
}
