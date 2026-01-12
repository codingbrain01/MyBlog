import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState, AppDispatch } from '../app/store'
import { loadBlogs, setPage, removeBlog } from '../features/blog/blogSlice'

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
        <div>
            <h2>Blogs</h2>

            <Link to="/create">Create Blog</Link> |{' '}
            <Link to="/logout">Logout</Link>

            {loading && <p>Loading...</p>}

            {!loading && items.length === 0 && (
                <p>No blogs yet. Create the first one.</p>
            )}

            {!loading &&
                items.map(blog => (
                    <div key={blog.id} style={{ borderBottom: '1px solid #ccc', margin: '1rem 0' }}>
                        <h3>{blog.title}</h3>
                        <p>{blog.content.slice(0, 100)}...</p>

                        {user?.id === blog.author_id && (
                            <>
                                <Link to={`/edit/${blog.id}`}>Edit</Link>{' '}
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this blog?')) {
                                            dispatch(removeBlog(blog.id))
                                        }
                                    }}
                                >
                                    Delete
                                </button>

                            </>
                        )}
                    </div>
                ))}

            {/* Pagination */}
            <div style={{ marginTop: '1rem' }}>
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
