import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, Link } from 'react-router-dom'
import type { RootState, AppDispatch } from '../app/store'
import { editBlog } from '../features/blog/blogSlice'
import { uploadBlogImages } from '../features/blog/blogService'

export default function EditBlog() {

    const { id } = useParams<{ id: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    const blog = useSelector((s: RootState) =>
        s.blog.items.find(b => b.id === id)
    )

    const [title, setTitle] = useState(blog?.title || '')
    const [content, setContent] = useState(blog?.content || '')
    const [images, setImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    // Generate previews whenever `images` changes
    useEffect(() => {
        const urls = images.map(file => URL.createObjectURL(file))
        setPreviews(urls)

        // Revoke object URLs on cleanup to avoid memory leaks
        return () => urls.forEach(url => URL.revokeObjectURL(url))
    }, [images])

    useEffect(() => {
        if (!blog) navigate('/')
    }, [blog, navigate])

    if (!blog) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        let imageUrls = blog.images ?? []

        if (images.length > 0 && user) {
            imageUrls = await uploadBlogImages(images, user.id)
        }

        await dispatch(editBlog({
            id: blog.id,
            title,
            content,
            images: imageUrls,
        }))

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

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => {
                        if (!e.target.files) return
                        setImages(Array.from(e.target.files))
                    }}
                />

                {/* Image Preview */}
                {previews.length > 0 && (
                    <div className="image-previews">
                        {previews.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`Preview ${i}`}
                                style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                        ))}
                    </div>
                )}

                <button type="submit">Update</button>
            </form>

            <Link to="/">Back to Blogs</Link>
        </div>
    )
}
