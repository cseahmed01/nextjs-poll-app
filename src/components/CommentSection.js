'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function CommentSection({ pollId, comments = [], onCommentAdded }) {
  const { data: session } = useSession()
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [showReplyForm, setShowReplyForm] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const replyRefs = useRef({})
  const [replyCharCounts, setReplyCharCounts] = useState({})

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/polls/${pollId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (res.ok) {
        setNewComment('')
        onCommentAdded()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to post comment')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async (parentId) => {
    const replyText = replyRefs.current[parentId]?.value || ''
    if (!replyText.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/polls/${pollId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText, parentId })
      })

      if (res.ok) {
        if (replyRefs.current[parentId]) {
          replyRefs.current[parentId].value = ''
        }
        setReplyCharCounts(prev => ({ ...prev, [parentId]: 0 }))
        setShowReplyForm(prev => ({ ...prev, [parentId]: false }))
        onCommentAdded()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to post reply')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const res = await fetch(`/api/polls/${pollId}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId })
      })

      if (res.ok) {
        onCommentAdded()
      } else {
        alert('Failed to delete comment')
      }
    } catch (err) {
      alert('Network error')
    }
  }

  const CommentItem = ({ comment, isReply = false }) => {
    const getUserInitial = (name) => {
      return name ? name.charAt(0).toUpperCase() : 'U'
    }

    return (
      <div className={`${isReply ? 'ml-8 mt-4' : 'mb-6'} bg-white rounded-lg p-4 shadow-sm`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
              {comment.user.profileImage ? (
                <img
                  src={comment.user.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                getUserInitial(comment.user.name)
              )}
            </div>
            <span className="font-semibold text-gray-900">{comment.user.name}</span>
            <span className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
        {session?.user?.role === 'ADMIN' && (
          <button
            onClick={() => handleDeleteComment(comment.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        )}
      </div>
      <p className="text-gray-700 mb-3">{comment.content}</p>

      {session && !isReply && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowReplyForm(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))
          }}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Reply
        </button>
      )}

      {showReplyForm[comment.id] && (
        <div className="mt-3">
          <textarea
            ref={(el) => { replyRefs.current[comment.id] = el }}
            placeholder="Write a reply..."
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            maxLength={1000}
            autoFocus
            dir="ltr"
            defaultValue=""
            onInput={(e) => setReplyCharCounts(prev => ({ ...prev, [comment.id]: e.target.value.length }))}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {(replyCharCounts[comment.id] || 0)}/1000
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSubmitReply(comment.id)}
                disabled={loading || (replyCharCounts[comment.id] || 0) === 0}
                className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setShowReplyForm(prev => ({ ...prev, [comment.id]: false }))
                  if (replyRefs.current[comment.id]) {
                    replyRefs.current[comment.id].value = ''
                  }
                  setReplyCharCounts(prev => ({ ...prev, [comment.id]: 0 }))
                }}
                className="text-gray-600 px-4 py-1 rounded text-sm hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.map(reply => (
        <CommentItem key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">💬 Comments ({comments.length})</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">{newComment.length}/1000</span>
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Posting...' : '💬 Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg mb-8">
          <p className="text-gray-600 mb-4">🔒 Login to join the discussion</p>
          <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            🚀 Sign in to comment →
          </a>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>📝 No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  )
}