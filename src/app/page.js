'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import PollCard from '@/components/PollCard'

export default function Home() {
  const { data: session } = useSession()
  const [polls, setPolls] = useState([])
  const [filteredPolls, setFilteredPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const fetchPolls = async () => {
    const res = await fetch('/api/polls')
    if (res.ok) {
      const data = await res.json()
      setPolls(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPolls()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'ALL') {
      setFilteredPolls(polls)
    } else {
      setFilteredPolls(polls.filter(poll => poll.category === selectedCategory))
    }
  }, [polls, selectedCategory])

  useEffect(() => {
    const handleClickOutside = () => setUserMenuOpen(false)
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [userMenuOpen])

  if (loading) return <div className="text-center mt-10">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">PollHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                  >
                    <span>{session.user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border">
                      <a href="/dashboard" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <span>📊</span>
                        <span>Dashboard</span>
                      </a>
                      <button onClick={() => signOut()} className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <a href="/login" className="text-gray-700 hover:text-blue-600">
                    🔐 Login
                  </a>
                  <a href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    ✏️ Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 All
            </button>
            <button
              onClick={() => setSelectedCategory('GENERAL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'GENERAL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 General
            </button>
            <button
              onClick={() => setSelectedCategory('SPORTS')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'SPORTS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚽ Sports
            </button>
            <button
              onClick={() => setSelectedCategory('POLITICS')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'POLITICS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏛️ Politics
            </button>
            <button
              onClick={() => setSelectedCategory('ENTERTAINMENT')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'ENTERTAINMENT'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎬 Entertainment
            </button>
            <button
              onClick={() => setSelectedCategory('TECHNOLOGY')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'TECHNOLOGY'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💻 Technology
            </button>
          </div>
        </div>

        {polls.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No polls yet</h2>
            <p className="text-gray-600 mb-6">
              {session ? 'Be the first to create a poll!' : 'Login to create your first poll.'}
            </p>
            {session && (
              <a href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                ➕ Create Poll
              </a>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedCategory === 'ALL' ? 'Latest Polls' : `${selectedCategory.charAt(0) + selectedCategory.slice(1).toLowerCase()} Polls`}
            </h2>
            {filteredPolls.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No polls found</h3>
                <p className="text-gray-600">Try selecting a different category or create the first poll in this category!</p>
              </div>
            ) : (
              filteredPolls.map(poll => (
                <PollCard key={poll.id} poll={poll} onVote={fetchPolls} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
