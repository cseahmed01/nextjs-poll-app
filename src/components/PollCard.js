'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function PollCard({ poll, onVote, showCommentsLink = true }) {
  const { data: session } = useSession()
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [error, setError] = useState('')

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)
  const now = new Date()
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < now
  const isScheduled = poll.scheduledAt && new Date(poll.scheduledAt) > now
  const canVote = !isExpired && !isScheduled && !hasVoted

  const getCategoryIcon = (category) => {
    const icons = {
      GENERAL: '📊',
      SPORTS: '⚽',
      POLITICS: '🏛️',
      ENTERTAINMENT: '🎬',
      TECHNOLOGY: '💻',
      EDUCATION: '📚',
      HEALTH: '🏥',
      BUSINESS: '💼',
      TRAVEL: '✈️',
      FOOD: '🍕',
      OTHER: '🔸'
    }
    return icons[category] || '📊'
  }

  const getStatusInfo = () => {
    if (isExpired) {
      return { text: '⏰ Voting Ended', color: 'text-red-600 bg-red-50' }
    }
    if (isScheduled) {
      return { text: `📅 Opens ${new Date(poll.scheduledAt).toLocaleDateString()}`, color: 'text-blue-600 bg-blue-50' }
    }
    return null
  }

  const handleVote = async () => {
    if (!selectedOption) return
    setError('')

    const res = await fetch(`/api/polls/${poll.id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId: selectedOption })
    })

    if (res.ok) {
      setHasVoted(true)
      onVote() // refresh polls
    } else {
      try {
        const data = await res.json()
        setError(data.error || 'An error occurred')
      } catch {
        setError('Server error')
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-lg font-bold text-gray-900">{poll.title}</h2>
            {getStatusInfo() && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo().color}`}>
                {getStatusInfo().text}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            by {poll.createdBy.name} • {new Date(poll.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getCategoryIcon(poll.category)} {poll.category.toLowerCase()}
            </span>
            {poll.tags && (
              <div className="flex flex-wrap gap-1">
                {poll.tags.split(',').map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
          {(poll.expiresAt || poll.scheduledAt) && (
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {poll.expiresAt && (
                <span>⏰ Expires: {new Date(poll.expiresAt).toLocaleString()}</span>
              )}
              {poll.scheduledAt && (
                <span>📅 Scheduled: {new Date(poll.scheduledAt).toLocaleString()}</span>
              )}
            </div>
          )}
        </div>
        <div className="text-right ml-4">
          <div className="text-xl font-bold text-blue-600">{totalVotes}</div>
          <div className="text-xs text-gray-500">votes</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-6">
        {poll.options.map((option, index) => {
          const voteCount = option.votes.length
          const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100).toFixed(1) : 0
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']

          return (
            <div key={option.id}>
              {hasVoted || !session ? (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{option.text}</span>
                    <span className="text-sm text-gray-500">{voteCount} votes ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[index % colors.length]} h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <label className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`poll-${poll.id}`}
                    value={option.id}
                    onChange={() => setSelectedOption(option.id)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option.text}</span>
                </label>
              )}
            </div>
          )
        })}
      </div>

      {session && canVote && (
        <button
          onClick={handleVote}
          disabled={!selectedOption}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          🗳️ Vote
        </button>
      )}

      {session && !canVote && (
        <div className="text-center py-4">
          <p className="text-gray-500">
            {isExpired ? '⏰ Voting has ended for this poll' : isScheduled ? '📅 This poll is scheduled for future release' : '✅ You have already voted'}
          </p>
        </div>
      )}

      {!session && (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-2">🔒 Login to vote</p>
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            🚀 Sign in →
          </a>
        </div>
      )}

      {showCommentsLink && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href={`/polls/${poll.id}`}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 text-center block"
          >
            💬 View Comments & Discussion
          </Link>
        </div>
      )}
    </div>
  )
}