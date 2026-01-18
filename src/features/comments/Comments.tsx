import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch, RootState } from '../../app/store'
import { loadComments, addComment, removeComment } from './commentSlice'
import type { Comment } from './commentService'

interface CommentsProps {
    blogId: string
}

export default function Comments({ blogId }: CommentsProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { items: comments, loading } = useSelector((s: RootState) => s.comments)
    const { user } = useSelector((s: RootState) => s.auth)

    const [newComment, setNewComment] = useState('')
    const [replyTo, setReplyTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')

    // Load comments for this blog
    useEffect(() => {
        dispatch(loadComments(blogId))
    }, [blogId, dispatch])

    const handlePostComment = async () => {
        if (!user || !newComment.trim()) return
        await dispatch(addComment({ blogId, authorId: user.id, content: newComment }))
        setNewComment('')
        dispatch(loadComments(blogId))
    }

    const handlePostReply = async (parentId: string) => {
        if (!user || !replyContent.trim()) return
        await dispatch(addComment({ blogId, authorId: user.id, content: replyContent, parentId }))
        setReplyContent('')
        setReplyTo(null)
        dispatch(loadComments(blogId))
    }

    const handleDeleteComment = async (id: string) => {
        if (!confirm('Delete this comment?')) return
        const deletedId = await dispatch(removeComment(id)).unwrap()
        dispatch(loadComments(blogId))
    }


    // Filter top-level comments
    const topLevelComments = comments.filter(c => !c.parent_id)

    return (
        <div className="comments-section">
            <h3 className="comments-title">Comments</h3>

            {user && (
                <div className="new-comment">
                    <textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        className="comment-input"
                    />
                    <button onClick={handlePostComment} className="comment-btn">Post Comment</button>
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
                                    <p>
                                        <strong>{comment.author_name}</strong>: {comment.content}
                                    </p>
                                    <div className="comment-actions">
                                        {user && <button className="reply-btn" onClick={() => setReplyTo(comment.id)}>Reply</button>}
                                        {isOwner && <button className="delete-btn" onClick={() => handleDeleteComment(comment.id)}>Delete</button>}
                                    </div>
                                </div>

                                {/* Reply input */}
                                {replyTo === comment.id && (
                                    <div className="reply-box">
                                        <textarea
                                            placeholder="Write a reply..."
                                            value={replyContent}
                                            onChange={e => setReplyContent(e.target.value)}
                                            className="reply-input"
                                        />
                                        <div className="reply-actions">
                                            <button onClick={() => handlePostReply(comment.id)} className="reply-send-btn">Send</button>
                                            <button onClick={() => setReplyTo(null)} className="reply-cancel-btn">Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {/* Replies */}
                                {replies.length > 0 && (
                                    <ul className="replies">
                                        {replies.map(reply => {
                                            const isReplyOwner = user?.id === reply.author_id
                                            return (
                                                <li key={reply.id} className="reply-item">
                                                    <p>
                                                        <strong>{reply.author_name}</strong>: {reply.content}
                                                    </p>
                                                    {isReplyOwner && (
                                                        <button className="delete-btn" onClick={() => handleDeleteComment(reply.id)}>Delete</button>
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
