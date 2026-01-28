import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch, RootState } from '../../app/store'
import { uploadBlogImages, deleteBlogImages } from '../blog/blogService'
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

    // Edit state for TOP-LEVEL COMMENTS
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
    const [editCommentContent, setEditCommentContent] = useState('')
    const [editCommentImages, setEditCommentImages] = useState<File[]>([])
    const [editCommentPreviews, setEditCommentPreviews] = useState<string[]>([])
    const [existingEditCommentImages, setExistingEditCommentImages] = useState<string[]>([])
    const [removedCommentImages, setRemovedCommentImages] = useState<string[]>([])

    // Edit state for REPLIES
    const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
    const [editReplyContent, setEditReplyContent] = useState('')
    const [editReplyImages, setEditReplyImages] = useState<File[]>([])
    const [editReplyPreviews, setEditReplyPreviews] = useState<string[]>([])
    const [existingEditReplyImages, setExistingEditReplyImages] = useState<string[]>([])
    const [removedReplyImages, setRemovedReplyImages] = useState<string[]>([])

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

    // Generate previews for editing COMMENTS
    useEffect(() => {
        const urls = editCommentImages.map(file => URL.createObjectURL(file))
        setEditCommentPreviews(urls)
        return () => urls.forEach(url => URL.revokeObjectURL(url))
    }, [editCommentImages])

    // Generate previews for editing REPLIES
    useEffect(() => {
        const urls = editReplyImages.map(file => URL.createObjectURL(file))
        setEditReplyPreviews(urls)
        return () => urls.forEach(url => URL.revokeObjectURL(url))
    }, [editReplyImages])

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

    // START editing a top-level COMMENT
    const handleStartEditComment = (comment: any) => {
        setEditingCommentId(comment.id)
        setEditCommentContent(comment.content)
        setExistingEditCommentImages(comment.images || [])
        setEditCommentImages([])
        setEditCommentPreviews([])
        setRemovedCommentImages([])
    }

    // SAVE edited top-level COMMENT
    const handleSaveEditComment = async (id: string) => {
        if (!editCommentContent.trim()) return

        try {

            // Delete removed images from storage
            if (removedCommentImages.length > 0) {
                await deleteBlogImages(removedCommentImages)
            }

            let imageUrls: string[]

            if (editCommentImages.length > 0) {
                const newImageUrls = await uploadBlogImages(editCommentImages, user!.id)
                imageUrls = [...existingEditCommentImages, ...newImageUrls]
            } else {
                // FIXED: Always use an array (empty or with existing images)
                imageUrls = existingEditCommentImages
            }

            // Update the database - ALWAYS pass images array (even if empty)
            await dispatch(editComment({ id, content: editCommentContent, images: imageUrls })).unwrap()

            // Clear all edit states
            setEditingCommentId(null)
            setEditCommentContent('')
            setEditCommentImages([])
            setEditCommentPreviews([])
            setExistingEditCommentImages([])
            setRemovedCommentImages([])

            // Reload comments from database
            await dispatch(loadComments(blogId)).unwrap()
        } catch (error) {
            alert('Failed to save comment. Please try again.')
        }
    }

    // CANCEL editing top-level COMMENT
    const handleCancelEditComment = () => {
        setEditingCommentId(null)
        setEditCommentContent('')
        setEditCommentImages([])
        setEditCommentPreviews([])
        setExistingEditCommentImages([])
        setRemovedCommentImages([])
    }

    // Remove existing image from COMMENT (and track for deletion)
    const handleRemoveExistingCommentImage = (index: number) => {
        const imageToRemove = existingEditCommentImages[index]

        // Add to removed list for deletion on save
        setRemovedCommentImages(prev => [...prev, imageToRemove])

        // Remove from existing images (this updates the preview immediately)
        setExistingEditCommentImages(prev => {
            const newArray = prev.filter((_, i) => i !== index)

            return newArray
        })
    }

    // START editing a REPLY
    const handleStartEditReply = (reply: any) => {
        setEditingReplyId(reply.id)
        setEditReplyContent(reply.content)
        setExistingEditReplyImages(reply.images || [])
        setEditReplyImages([])
        setEditReplyPreviews([])
        setRemovedReplyImages([])
    }

    // SAVE edited REPLY
    const handleSaveEditReply = async (id: string) => {
        if (!editReplyContent.trim()) return

        try {

            // Delete removed images from storage
            if (removedReplyImages.length > 0) {
                await deleteBlogImages(removedReplyImages)
            }

            let imageUrls: string[]

            if (editReplyImages.length > 0) {
                const newImageUrls = await uploadBlogImages(editReplyImages, user!.id)
                imageUrls = [...existingEditReplyImages, ...newImageUrls]
            } else {
                // FIXED: Always use an array (empty or with existing images)
                imageUrls = existingEditReplyImages
            }

            // Update the database - ALWAYS pass images array (even if empty)
            await dispatch(editComment({ id, content: editReplyContent, images: imageUrls })).unwrap()

            // Clear all edit states
            setEditingReplyId(null)
            setEditReplyContent('')
            setEditReplyImages([])
            setEditReplyPreviews([])
            setExistingEditReplyImages([])
            setRemovedReplyImages([])

            // Reload comments from database
            await dispatch(loadComments(blogId)).unwrap()

        } catch (error) {
            console.error('Error saving reply:', error)
            alert('Failed to save reply. Please try again.')
        }
    }

    // CANCEL editing REPLY
    const handleCancelEditReply = () => {
        setEditingReplyId(null)
        setEditReplyContent('')
        setEditReplyImages([])
        setEditReplyPreviews([])
        setExistingEditReplyImages([])
        setRemovedReplyImages([])
    }

    // Remove existing image from REPLY (and track for deletion)
    const handleRemoveExistingReplyImage = (index: number) => {
        const imageToRemove = existingEditReplyImages[index]

        // Add to removed list for deletion on save
        setRemovedReplyImages(prev => [...prev, imageToRemove])

        // Remove from existing images (this updates the preview immediately)
        setExistingEditReplyImages(prev => {
            const newArray = prev.filter((_, i) => i !== index)

            return newArray
        })
    }

    // Delete comment and its images
    const handleDeleteComment = async (id: string) => {
        if (!confirm('Delete this comment?')) return

        try {
            // Find the comment to get its images
            const commentToDelete = comments.find(c => c.id === id)

            // Delete associated images from storage
            if (commentToDelete?.images && commentToDelete.images.length > 0) {
                await deleteBlogImages(commentToDelete.images)
            }

            // Delete the comment from database
            await dispatch(removeComment(id)).unwrap()
            dispatch(loadComments(blogId))
        } catch (error) {
            console.error('Error deleting comment:', error)
            alert('Failed to delete comment. Please try again.')
        }
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
                                    {/* Top-level COMMENT */}
                                    {editingCommentId === comment.id ? (
                                        <div className="edit-box">
                                            <textarea
                                                value={editCommentContent}
                                                onChange={e => setEditCommentContent(e.target.value)}
                                                className="comment-input"
                                            />

                                            {/* Display existing images with remove option */}
                                            {existingEditCommentImages.length > 0 && (
                                                <div className="existing-images">
                                                    <p className="image-label">Current images:</p>
                                                    <div className="image-previews">
                                                        {existingEditCommentImages.map((src, i) => (
                                                            <div key={i} className="preview-wrapper">
                                                                <img
                                                                    src={src}
                                                                    alt={`Existing ${i}`}
                                                                    className="comment-preview-img"
                                                                />
                                                                <button
                                                                    className="btn-remove-image"
                                                                    onClick={() => handleRemoveExistingCommentImage(i)}
                                                                    type="button"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Upload new images */}
                                            <div className="upload-section">
                                                <label className="upload-label">Add new images:</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={e => {
                                                        if (!e.target.files) return
                                                        setEditCommentImages(Array.from(e.target.files))
                                                    }}
                                                />
                                            </div>

                                            {/* Preview new images */}
                                            {editCommentPreviews.length > 0 && (
                                                <div className="image-previews">
                                                    <p className="image-label">New images to add:</p>
                                                    {editCommentPreviews.map((src, i) => (
                                                        <img
                                                            key={i}
                                                            src={src}
                                                            alt={`New preview ${i}`}
                                                            className="comment-preview-img"
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            <div className="comment-actions">
                                                <button className="reply-btn" onClick={() => handleSaveEditComment(comment.id)}>
                                                    Save
                                                </button>
                                                <button className="delete-btn" onClick={handleCancelEditComment}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>
                                            <strong>{comment.author_name}</strong>: {comment.content}
                                        </p>
                                    )}

                                    {/* ===== Comment Images (only show when NOT editing) ===== */}
                                    {editingCommentId !== comment.id && comment.images && comment.images.length > 0 && (
                                        <div className="comment-images">
                                            {comment.images.map((src, i) => (
                                                <img
                                                    key={i}
                                                    src={src}
                                                    alt={`Comment image ${i + 1}`}
                                                    className="comment-img"
                                                    onClick={() => setActiveImage(src)}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* ===== Top Comment Actions ===== */}
                                    {editingCommentId !== comment.id && (
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
                                                    onClick={() => handleStartEditComment(comment)}
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
                                    )}
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
                                                    {/* REPLY EDIT MODE */}
                                                    {editingReplyId === reply.id ? (
                                                        <div className="edit-box">
                                                            <textarea
                                                                value={editReplyContent}
                                                                onChange={e => setEditReplyContent(e.target.value)}
                                                                className="comment-input"
                                                            />

                                                            {/* Display existing images with remove option */}
                                                            {existingEditReplyImages.length > 0 && (
                                                                <div className="existing-images">
                                                                    <p className="image-label">Current images:</p>
                                                                    <div className="image-previews">
                                                                        {existingEditReplyImages.map((src, i) => (
                                                                            <div key={i} className="preview-wrapper">
                                                                                <img
                                                                                    src={src}
                                                                                    alt={`Existing ${i}`}
                                                                                    className="comment-preview-img"
                                                                                />
                                                                                <button
                                                                                    className="btn-remove-image"
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveExistingReplyImage(i)}
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Upload new images */}
                                                            <div className="upload-section">
                                                                <label className="upload-label">Add new images:</label>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    multiple
                                                                    onChange={e => {
                                                                        if (!e.target.files) return
                                                                        setEditReplyImages(Array.from(e.target.files))
                                                                    }}
                                                                />
                                                            </div>

                                                            {/* Preview new images */}
                                                            {editReplyPreviews.length > 0 && (
                                                                <div className="image-previews">
                                                                    <p className="image-label">New images to add:</p>
                                                                    {editReplyPreviews.map((src, i) => (
                                                                        <img
                                                                            key={i}
                                                                            src={src}
                                                                            alt={`New preview ${i}`}
                                                                            className="comment-preview-img"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="comment-actions">
                                                                <button className="reply-btn" onClick={() => handleSaveEditReply(reply.id)}>
                                                                    Save
                                                                </button>
                                                                <button className="delete-btn" onClick={handleCancelEditReply}>
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p>
                                                            <strong>{reply.author_name}</strong>: {reply.content}
                                                        </p>
                                                    )}

                                                    {/* Reply images (only show when NOT editing) */}
                                                    {editingReplyId !== reply.id && reply.images && reply.images.length > 0 && (
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

                                                    {/* Reply actions (only show when NOT editing) */}
                                                    {editingReplyId !== reply.id && (
                                                        <div className="reply-actions">
                                                            {isReplyOwner && (
                                                                <button
                                                                    className="reply-btn"
                                                                    onClick={() => handleStartEditReply(reply)}
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
                                                    )}

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