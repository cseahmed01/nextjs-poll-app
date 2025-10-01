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

  const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U'
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
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4">
      {/* Header with user info - Facebook style */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
          {poll.createdBy.profileImage ? (
            <img
              src={poll.createdBy.profileImage}
              alt={poll.createdBy.name}
              className="w-full h-full object-cover"
            />
          ) : (
            getUserInitial(poll.createdBy.name)
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900">{poll.createdBy.name}</h3>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{new Date(poll.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">{totalVotes}</div>
          <div className="text-xs text-gray-500">votes</div>
        </div>
      </div>

      {/* Poll content */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{poll.title}</h2>
        {getStatusInfo() && (
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${getStatusInfo().color}`}>
            {getStatusInfo().text}
          </div>
        )}
        {(poll.expiresAt || poll.scheduledAt) && (
          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
            {poll.expiresAt && (
              <span>⏰ Expires: {new Date(poll.expiresAt).toLocaleString()}</span>
            )}
            {poll.scheduledAt && (
              <span>📅 Scheduled: {new Date(poll.scheduledAt).toLocaleString()}</span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Poll Options */}
      <div className="space-y-3 mb-4">
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
                <label className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg border border-gray-200">
                  <input
                    type="radio"
                    name={`poll-${poll.id}`}
                    value={option.id}
                    onChange={() => setSelectedOption(option.id)}
                    className="mr-3"
                  />
                  <span className="text-gray-700 font-medium">{option.text}</span>
                </label>
              )}
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex space-x-4">
          {session && canVote && (
            <button
              onClick={handleVote}
              disabled={!selectedOption}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              🗳️ Vote
            </button>
          )}

          {session && !canVote && (
            <div className="text-sm text-gray-500 py-2">
              {isExpired ? '⏰ Voting ended' : isScheduled ? '📅 Scheduled' : '✅ Voted'}
            </div>
          )}

          {!session && (
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              🔒 Login to vote
            </a>
          )}
        </div>

        {showCommentsLink && (
          <Link
            href={`/polls/${poll.id}`}
            className="text-gray-600 hover:text-gray-800 font-medium flex items-center space-x-1"
          >
            <span>💬</span>
            <span>Comments</span>
          </Link>
        )}
      </div>
    </div>
  )
}