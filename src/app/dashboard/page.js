'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PollCard from '@/components/PollCard'
import { pollTemplates, getTemplateById } from '@/lib/pollTemplates'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPoll, setEditingPoll] = useState(null)
  const [canEditOptions, setCanEditOptions] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [tags, setTags] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    if (session.user.role === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }

    fetchUserData()
  }, [session, status, router])

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(null)
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [dropdownOpen])

  const fetchUserData = async () => {
    const res = await fetch('/api/user/polls')
    if (res.ok) {
      const userData = await res.json()
      setData(userData)
    }
    setLoading(false)
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const selectTemplate = (templateId) => {
    const template = getTemplateById(templateId)
    if (template) {
      setTitle(template.title)
      setCategory(template.category)
      setOptions(template.options)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const filteredOptions = options.filter(opt => opt.trim())
    if (!title.trim() || filteredOptions.length < 2) {
      setError('Title and at least 2 options required')
      return
    }

    const res = await fetch('/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        category,
        tags: tags.trim(),
        expiresAt: expiresAt || null,
        scheduledAt: scheduledAt || null,
        options: filteredOptions
      })
    })

    if (res.ok) {
      setTitle('')
      setOptions(['', ''])
      setShowCreateForm(false)
      fetchUserData() // Refresh data
    } else {
      try {
        const data = await res.json()
        setError(data.error || 'An error occurred')
      } catch {
        setError('Server error')
      }
    }
  }

  const startEdit = (poll) => {
    setEditingPoll(poll)
    setTitle(poll.title)
    setCategory(poll.category)
    setTags(poll.tags || '')
    setExpiresAt(poll.expiresAt ? new Date(poll.expiresAt).toISOString().slice(0, 16) : '')
    setScheduledAt(poll.scheduledAt ? new Date(poll.scheduledAt).toISOString().slice(0, 16) : '')
    setOptions(poll.options.map(opt => opt.text))
    setCanEditOptions(!poll.options.some(opt => opt.votes.length > 0))
    setShowCreateForm(true)
  }

  const cancelEdit = () => {
    setEditingPoll(null)
    setCanEditOptions(true)
    setTitle('')
    setCategory('GENERAL')
    setTags('')
    setExpiresAt('')
    setScheduledAt('')
    setOptions(['', ''])
    setShowCreateForm(false)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const filteredOptions = options.filter(opt => opt.trim())
    if (!title.trim() || filteredOptions.length < 2) {
      setError('Title and at least 2 options required')
      return
    }

    const res = await fetch(`/api/polls/${editingPoll.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        category,
        tags: tags.trim(),
        expiresAt: expiresAt || null,
        scheduledAt: scheduledAt || null,
        options: filteredOptions
      })
    })

    if (res.ok) {
      setTitle('')
      setOptions(['', ''])
      setShowCreateForm(false)
      setEditingPoll(null)
      fetchUserData() // Refresh data
    } else {
      try {
        const data = await res.json()
        setError(data.error || 'An error occurred')
      } catch {
        setError('Server error')
      }
    }
  }

  const handleDelete = async (pollId) => {
    if (!confirm('Are you sure you want to delete this poll?')) return

    const res = await fetch(`/api/polls/${pollId}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      fetchUserData() // Refresh data
    } else {
      alert('Error deleting poll')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">D</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {session.user.name}!</p>
              </div>
            </div>
            <a href="/" className="text-gray-700 hover:text-blue-600">
              ← Back to Feed
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Polls</p>
                <p className="text-3xl font-bold text-gray-800">{data?.stats.totalPolls || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Votes</p>
                <p className="text-3xl font-bold text-gray-800">{data?.stats.totalVotes || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🗳️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Comments</p>
                <p className="text-3xl font-bold text-gray-800">{data?.stats.totalComments || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
            </div>
          </div>
        </div>

        {/* Create Poll Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create New Poll</h2>
            <button
              onClick={showCreateForm ? cancelEdit : () => setShowCreateForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {showCreateForm ? '❌ Cancel' : '➕ New Poll'}
            </button>
          </div>

          {showCreateForm && (
            <>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={editingPoll ? handleEditSubmit : handleSubmit} className="space-y-4">
                {/* Template Selection */}
                {!editingPoll && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🚀 Quick Start Templates (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {pollTemplates.slice(0, 6).map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => selectTemplate(template.id)}
                          className="p-2 border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors text-left text-xs"
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <span>{template.icon}</span>
                            <span className="font-medium">{template.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Click to auto-fill poll</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poll Question
                  </label>
                  <input
                    type="text"
                    placeholder="What's your question?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="GENERAL">📊 General</option>
                      <option value="SPORTS">⚽ Sports</option>
                      <option value="POLITICS">🏛️ Politics</option>
                      <option value="ENTERTAINMENT">🎬 Entertainment</option>
                      <option value="TECHNOLOGY">💻 Technology</option>
                      <option value="EDUCATION">📚 Education</option>
                      <option value="HEALTH">🏥 Health</option>
                      <option value="BUSINESS">💼 Business</option>
                      <option value="TRAVEL">✈️ Travel</option>
                      <option value="FOOD">🍕 Food</option>
                      <option value="OTHER">🔸 Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. fun, survey, opinion"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ⏰ Expiration Date & Time (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">When voting should stop</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📅 Schedule Release (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">When poll becomes visible</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                    {!canEditOptions && (
                      <span className="text-sm text-gray-500 ml-2">(Cannot edit options after votes have been cast)</span>
                    )}
                  </label>
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          disabled={!canEditOptions}
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!canEditOptions ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          required
                        />
                        {options.length > 2 && canEditOptions && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                            title="Remove option"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {canEditOptions && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-2 w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded hover:border-blue-400 hover:text-blue-600"
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  {editingPoll ? 'Update Poll' : 'Create Poll'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Polls List */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Polls</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ➕ New Poll
            </button>
          </div>

          {data?.polls.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No polls yet</h3>
              <p className="text-gray-600 mb-6">Create your first poll to get started!</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Create Your First Poll
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {data.polls.map(poll => (
                <div key={poll.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{poll.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4">
                        <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
                        <span>{poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)} votes</span>
                        <span>{poll._count?.comments || 0} comments</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end space-y-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 self-start sm:self-end">
                        {poll.options.length} options
                      </span>
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === poll.id ? null : poll.id)}
                          className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {dropdownOpen === poll.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={() => {
                                startEdit(poll)
                                setDropdownOpen(null)
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors flex items-center space-x-2"
                            >
                              <span>✏️</span>
                              <span>Edit Poll</span>
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(poll.id)
                                setDropdownOpen(null)
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors flex items-center space-x-2"
                            >
                              <span>🗑️</span>
                              <span>Delete Poll</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {poll.options.map((option, index) => {
                      const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)
                      const percentage = totalVotes > 0 ? (option.votes.length / totalVotes * 100).toFixed(1) : 0
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']

                      return (
                        <div key={option.id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 flex-1">{option.text}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {option.votes.length} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}