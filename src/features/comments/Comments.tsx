import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch, RootState } from '../../app/store'
import { uploadBlogImages } from '../blog/blogService'
import { loadComments, addComment, editComment, removeComment } from './commentSlice'


interface CommentPayload {
    blogId: string
    authorId: string
    content: string
    parentId?: string
    images?: string[]
}

interface CommentsProps {
    blogId: string
}

export default function Comments({ blogId }: CommentsProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { items: comments, loading } = useSelector((s: RootState) => s.comments)
    const { user } = useSelector((s: RootState) => s.auth)

    // Main comment state
    const [newComment, setNewComment] = useState('')
    const [commentImages, setCommentImages] = useState<File[]>([])
    const [commentPreviews, setCommentPreviews] = useState<string[]>([])
    const [activeImage, setActiveImage] = useState<string | null>(null)

    // Reply state
    const [replyTo, setReplyTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [replyImages, setReplyImages] = useState<File[]>([])
    const [replyPreviews, setReplyPreviews] = useState<string[]>([])

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')

    // Generate previews for main comment
    useEffect(() => {
        const urls = commentImages.map(file => URL.createObjectURL(file))
        setCommentPreviews(urls)
        return () => urls.forEach(url => URL.revokeObjectURL(url))
    }, [commentImages])

    // Generate previews for replies
    useEffect(() => {
        const urls = replyImages.map(file => URL.createObjectURL(file))
        setReplyPreviews(urls)
        return () => urls.forEach(url => URL.revokeObjectURL(url))
    }, [replyImages])

    // Load comments
    useEffect(() => {
        dispatch(loadComments(blogId))
    }, [blogId, dispatch])

    // Post a new comment
    const handlePostComment = async () => {
        if (!user || !newComment.trim()) return

        let imageUrls: string[] | undefined
        if (commentImages.length > 0) {
            imageUrls = await uploadBlogImages(commentImages, user.id)
        }

        const payload: CommentPayload = {
            blogId,
            authorId: user.id,
            content: newComment,
            images: imageUrls
        }

        await dispatch(addComment(payload))
        setNewComment('')
        setCommentImages([])
        dispatch(loadComments(blogId))
    }

    // Post a reply
    const handlePostReply = async (parentId: string) => {
        if (!user || !replyContent.trim()) return

        let imageUrls: string[] | undefined
        if (replyImages.length > 0) {
            imageUrls = await uploadBlogImages(replyImages, user.id)
        }

        const payload: CommentPayload = {
            blogId,
            authorId: user.id,
            content: replyContent,
            parentId,
            images: imageUrls
        }

        await dispatch(addComment(payload))
        setReplyContent('')
        setReplyImages([])
        setReplyTo(null)
        dispatch(loadComments(blogId))
    }

    // Edit
    const handleEditSave = async (id: string) => {
        if (!editContent.trim()) return

        await dispatch(editComment({ id, content: editContent }))
        setEditingId(null)
        setEditContent('')
    }

    // Delete
    const handleDeleteComment = async (id: string) => {
        if (!confirm('Delete this comment?')) return
        await dispatch(removeComment(id)).unwrap()
        dispatch(loadComments(blogId))
    }

    // Top-level comments
    const topLevelComments = comments.filter(c => !c.parent_id)

    return (
        <div className="comments-section">
            <h3 className="comments-title">Comments</h3>

            {/* ===== NEW COMMENT ===== */}
            {user && (
                <div className="new-comment">
                    <textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        className="comment-input"
                        required
                    />

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => {
                            if (!e.target.files) return
                            setCommentImages(Array.from(e.target.files))
                        }}
                    />

                    {commentPreviews.length > 0 && (
                        <div className="image-previews">
                            {commentPreviews.map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt={`Preview ${i}`}
                                    className="comment-preview-img"
                                />
                            ))}
                        </div>
                    )}

                    <button onClick={handlePostComment} className="comment-btn">
                        Post Comment
                    </button>
                </div>
            )}

            {loading ? (
                <p className="loading">Loading comments...</p>
            ) : topLevelComments.length === 0 ? (
                <p className="no-comments">Be the first to comment!</p>
            ) : (
                <ul className="comment-list">
                    {topLevelComments.map(comment => {
                        const replies = comments.filter(c => c.parent_id === comment.id)
                        const isOwner = user?.id === comment.author_id

                        return (
                            <li key={comment.id} className="comment-item">
                                <div className="comment-content">
                                    {/* Top-level */}
                                    {editingId === comment.id ? (
                                        <>
                                            <textarea
                                                value={editContent}
                                                onChange={e => setEditContent(e.target.value)}
                                                className="comment-input"
                                            />
                                            <div className="comment-actions">
                                            <button className="reply-btn" onClick={() => handleEditSave(comment.id)}>Save</button>
                                            <button className="delete-btn" onClick={() => setEditingId(null)}>Cancel</button>
                                            </div>
                                        </>
                                    ) : (
                                        <p>
                                            <strong>{comment.author_name}</strong>: {comment.content}
                                        </p>
                                    )}


                                    {/* ===== Comment Images ===== */}
                                    {comment.images && comment.images.length > 0 && (
                                        <div className="comment-images">
                                            {comment.images.map((src, i) => (
                                                <img
                                                    key={i}
                                                    src={src}
                                                    alt={`Comment image ${i + 1}`}
                                                    className="comment-img"
                                                    onClick={() => setActiveImage(src)} // open modal on click
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* ===== Top Comment Actions ===== */}
                                    <div className="comment-actions">
                                        {user && (
                                            <button
                                                className="reply-btn"
                                                onClick={() => setReplyTo(comment.id)}
                                            >
                                                Reply
                                            </button>
                                        )}
                                        {isOwner && (
                                            <button
                                                className="reply-btn"
                                                onClick={() => {
                                                    setEditingId(comment.id)
                                                    setEditContent(comment.content)
                                                }}
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {isOwner && (
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteComment(comment.id)}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* ===== Image Modal ===== */}
                                {activeImage && (
                                    <div
                                        className="image-modal"
                                        onClick={() => setActiveImage(null)}
                                    >
                                        <img src={activeImage} alt="Full view" />
                                    </div>
                                )}


                                {/* ===== REPLY BOX ===== */}
                                {replyTo === comment.id && (
                                    <div className="reply-box">
                                        <textarea
                                            placeholder="Write a reply..."
                                            value={replyContent}
                                            onChange={e => setReplyContent(e.target.value)}
                                            className="reply-input"
                                        />

                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={e => {
                                                if (!e.target.files) return
                                                setReplyImages(Array.from(e.target.files))
                                            }}
                                        />

                                        {replyPreviews.length > 0 && (
                                            <div className="image-previews">
                                                {replyPreviews.map((src, i) => (
                                                    <img
                                                        key={i}
                                                        src={src}
                                                        alt={`Reply preview ${i}`}
                                                        className="comment-preview-img"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Reply Actions */}
                                        <div className="reply-actions">
                                            <button
                                                className="reply-btn"
                                                onClick={() => handlePostReply(comment.id)}
                                            >
                                                Send
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => setReplyTo(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        
                                    </div>
                                )}

                                {/* ===== REPLIES ===== */}
                                {replies.length > 0 && (
                                    <ul className="replies">
                                        {replies.map(reply => {
                                            const isReplyOwner = user?.id === reply.author_id
                                            return (
                                                <li key={reply.id} className="reply-item">
                                                    {editingId === reply.id ? (
                                                        <>
                                                            <textarea
                                                                value={editContent}
                                                                onChange={e => setEditContent(e.target.value)}
                                                                className="comment-input"
                                                            />
                                                            <button className="reply-btn" onClick={() => handleEditSave(reply.id)}>Save</button>
                                                            <button className="delete-btn" onClick={() => setEditingId(null)}>Cancel</button>
                                                        </>
                                                    ) : (
                                                        <p>
                                                            <strong>{reply.author_name}</strong>: {reply.content}
                                                        </p>
                                                    )}

                                                    {/* Reply images */}
                                                    {reply.images && reply.images.length > 0 && (
                                                        <div className="comment-images">
                                                            {reply.images.map((src, i) => (
                                                                <img
                                                                    key={i}
                                                                    src={src}
                                                                    alt={`Reply image ${i + 1}`}
                                                                    className="comment-img"
                                                                    onClick={() => setActiveImage(src)}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="reply-actions">
                                                        {isReplyOwner && (
                                                            <button
                                                                className="reply-btn"
                                                                onClick={() => {
                                                                    setEditingId(reply.id)
                                                                    setEditContent(reply.content)
                                                                }}
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        {isReplyOwner && (
                                                            <button
                                                                className="delete-btn"
                                                                onClick={() => handleDeleteComment(reply.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>

                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </li>

                        )
                    })}
                </ul>
            )}
        </div>
    )
}
