import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState, AppDispatch } from '../app/store'
import { loadBlogs, setPage } from '../features/blog/blogSlice'

export default function Blogs() {
    const dispatch = useDispatch<AppDispatch>()
    const { items, total, page, pageSize, loading } = useSelector(
        (s: RootState) => s.blog
    )
    const user = useSelector((s: RootState) => s.auth.user)

    useEffect(() => {
        dispatch(loadBlogs({ page, pageSize }))
    }, [dispatch, page, pageSize])

    const totalPages = Math.ceil(total / pageSize)

    const { error } = useSelector((s: RootState) => s.blog)

    { error && <p style={{ color: 'red' }}>{error}</p> }


    return (
        <div className='container'>
            <div className="header">
                <h2>Blogbook</h2>
                <div>
                    <Link to="/profile">{user?.name}</Link>
                    <Link to="/logout"><button>Logout</button></Link>
                </div>
            </div>
            <Link to="/create"><button>Create Blog</button></Link>

            {loading && <p>Loading...</p>}

            {!loading && items.length === 0 && (
                <p>No blogs yet. Create the first one.</p>
            )}

            {!loading &&
                items.map(blog => (
                    <div className='blog-card' key={blog.id}>
                        <Link to={`/blog/${blog.id}`}><h3>{blog.title}</h3></Link> 
                        <p className='content'>{blog.content.slice(0, 100)}</p>
                    </div>
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

                <button
                    disabled={page === totalPages}
                    onClick={() => dispatch(setPage(page + 1))}
                >
                    Next
                </button>
            </div>
        </div>
    )
}
