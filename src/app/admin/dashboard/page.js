'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('polls')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchAdminData()
  }, [session, status, router])

  const fetchAdminData = async () => {
    const res = await fetch('/api/admin/data')
    if (res.ok) {
      const adminData = await res.json()
      setData(adminData)
    }
    setLoading(false)
  }

  const handleDeletePoll = async (pollId) => {
    if (!confirm('Are you sure you want to delete this poll?')) return

    const res = await fetch(`/api/admin/polls/${pollId}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      fetchAdminData()
    } else {
      alert('Error deleting poll')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      fetchAdminData()
    } else {
      alert('Error deleting user')
    }
  }

  const handlePromoteUser = async (userId) => {
    const res = await fetch(`/api/admin/users/${userId}/promote`, {
      method: 'PUT'
    })

    if (res.ok) {
      fetchAdminData()
    } else {
      alert('Error promoting user')
    }
  }

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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage polls and users</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{data?.stats.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Polls</p>
                <p className="text-3xl font-bold text-gray-800">{data?.stats.totalPolls || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🗳️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Admins</p>
                <p className="text-3xl font-bold text-gray-800">{data?.stats.totalAdmins || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('polls')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'polls'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 All Polls
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👥 All Users
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'polls' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">All Polls</h2>
                {data?.polls.length === 0 ? (
                  <p className="text-gray-600">No polls yet.</p>
                ) : (
                  <div className="space-y-4">
                    {data.polls.map(poll => (
                      <div key={poll.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">{poll.title}</h3>
                            <p className="text-sm text-gray-600">By {poll.createdBy.name} ({poll.createdBy.email})</p>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">{poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)} votes</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {getCategoryIcon(poll.category)} {poll.category.toLowerCase()}
                                </span>
                                {poll.tags && (
                                  <div className="flex flex-wrap gap-1">
                                    {poll.tags.split(',').slice(0, 2).map((tag, index) => (
                                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                        #{tag.trim()}
                                      </span>
                                    ))}
                                    {poll.tags.split(',').length > 2 && (
                                      <span className="text-xs text-gray-500">+{poll.tags.split(',').length - 2} more</span>
                                    )}
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
                          </div>
                          <button
                            onClick={() => handleDeletePoll(poll.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-4"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                        <div className="space-y-2">
                          {poll.options.map(option => (
                            <div key={option.id} className="flex justify-between">
                              <span>{option.text}</span>
                              <span>{option.votes.length} votes</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">All Users</h2>
                {data?.users.length === 0 ? (
                  <p className="text-gray-600">No users yet.</p>
                ) : (
                  <div className="space-y-4">
                    {data.users.map(user => (
                      <div key={user.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-500">Role: {user.role}</p>
                          </div>
                          <div className="flex space-x-2">
                            {user.role === 'USER' && (
                              <button
                                onClick={() => handlePromoteUser(user.id)}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              >
                                ⭐ Promote to Admin
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}