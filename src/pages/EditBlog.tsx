import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, Link } from 'react-router-dom'
import type { RootState, AppDispatch } from '../app/store'
import { editBlog } from '../features/blog/blogSlice'

export default function EditBlog() {
    const { id } = useParams<{ id: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    const blog = useSelector((s: RootState) =>
        s.blog.items.find(b => b.id === id)
    )

    const [title, setTitle] = useState(blog?.title || '')
    const [content, setContent] = useState(blog?.content || '')

    useEffect(() => {
        if (!blog) navigate('/')
    }, [blog, navigate])

    if (!blog) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await dispatch(editBlog({ id: blog.id, title, content }))
        navigate('/')
    }

    const user = useSelector((s: RootState) => s.auth.user)

    useEffect(() => {
        if (!blog || blog.author_id !== user?.id) {
            navigate('/')
        }
    }, [blog, user, navigate])


    return (
        <div className='container'>
            <h2>Edit Blog</h2>

            <form onSubmit={handleSubmit}>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />

                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                />

                <button type="submit">Update</button>
            </form>

            <Link to="/">Back to Blogs</Link>
        </div>
    )
}
