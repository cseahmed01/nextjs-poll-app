'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import PollCard from '@/components/PollCard'
import CommentSection from '@/components/CommentSection'

export default function PollDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPoll()
  }, [params.id])

  const fetchPoll = async () => {
    try {
      const res = await fetch(`/api/polls/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setPoll(data)
      } else {
        setError('Poll not found')
      }
    } catch (err) {
      setError('Failed to load poll')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = () => {
    fetchPoll() // Refresh poll data after voting
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">Loading poll...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center text-red-600">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Polls
        </button>

        <div className="space-y-8">
          <PollCard poll={poll} onVote={handleVote} showCommentsLink={false} />

          <CommentSection pollId={poll.id} comments={poll.comments} onCommentAdded={fetchPoll} />
        </div>
      </div>
    </div>
  )
}