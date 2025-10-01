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

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('polls')}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="text-xl">📊</span>
                  <span className="font-medium">Manage Polls</span>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="text-xl">👥</span>
                  <span className="font-medium">Manage Users</span>
                </button>

                <a
                  href="/"
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span className="text-xl">🏠</span>
                  <span className="font-medium">View Site</span>
                </a>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">System Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Platform</span>
                    <span className="font-medium">PollHub Admin</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Version</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">Today</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-medium text-green-600">{data?.stats.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Polls</span>
                    <span className="font-medium text-blue-600">{data?.stats.totalPolls || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Votes</span>
                    <span className="font-medium text-purple-600">{data?.stats.totalVotes || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-1">Total Users</p>
                    <p className="text-4xl font-bold text-blue-900">{data?.stats.totalUsers || 0}</p>
                    <p className="text-xs text-blue-600 mt-1">Registered accounts</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">Total Polls</p>
                    <p className="text-4xl font-bold text-green-900">{data?.stats.totalPolls || 0}</p>
                    <p className="text-xs text-green-600 mt-1">Active polls</p>
                  </div>
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 border border-purple-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-1">Total Votes</p>
                    <p className="text-4xl font-bold text-purple-900">{data?.stats.totalVotes || 0}</p>
                    <p className="text-xs text-purple-600 mt-1">User interactions</p>
                  </div>
                  <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🗳️</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg p-6 border border-red-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-1">Admins</p>
                    <p className="text-4xl font-bold text-red-900">{data?.stats.totalAdmins || 0}</p>
                    <p className="text-xs text-red-600 mt-1">System administrators</p>
                  </div>
                  <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👑</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
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
          </div>
        </div>

        {/* System Alerts & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔔 System Alerts</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">✅ All systems operational</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">📈 User engagement up 15% this week</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">⚠️ 3 polls need content review</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors">
                📧 Send system announcement
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 text-green-800 rounded-lg hover:bg-green-100 transition-colors">
                📊 Generate monthly report
              </button>
              <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-800 rounded-lg hover:bg-purple-100 transition-colors">
                🔧 System maintenance
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Admin Tools</h4>
              <div className="space-y-2">
                <button className="block text-sm text-gray-600 hover:text-blue-600">System Settings</button>
                <button className="block text-sm text-gray-600 hover:text-blue-600">User Analytics</button>
                <button className="block text-sm text-gray-600 hover:text-blue-600">Content Moderation</button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Reports</h4>
              <div className="space-y-2">
                <button className="block text-sm text-gray-600 hover:text-blue-600">Poll Statistics</button>
                <button className="block text-sm text-gray-600 hover:text-blue-600">User Activity</button>
                <button className="block text-sm text-gray-600 hover:text-blue-600">System Health</button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Support</h4>
              <div className="space-y-2">
                <button className="block text-sm text-gray-600 hover:text-blue-600">Admin Guide</button>
                <button className="block text-sm text-gray-600 hover:text-blue-600">Contact Support</button>
                <button className="block text-sm text-red-600 hover:text-red-700">Sign Out</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-6 pt-6 text-center">
            <p className="text-sm text-gray-500">© 2024 PollHub Admin Panel. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}