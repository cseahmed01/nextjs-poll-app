'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import PollCard from '@/components/PollCard'

export default function Home() {
  const { data: session } = useSession()
  const [polls, setPolls] = useState([])
  const [filteredPolls, setFilteredPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchPolls = async (limit = 5, offsetParam = 0) => {
    const res = await fetch(`/api/polls?limit=${limit}&offset=${offsetParam}`)
    if (res.ok) {
      const data = await res.json()
      if (offsetParam === 0) {
        setPolls(data)
      } else {
        setPolls(prev => [...prev, ...data])
      }
      if (data.length < limit) setHasMore(false)
    }
    setLoading(false)
    setLoadingMore(false)
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true)
      const newOffset = offset + 5
      setOffset(newOffset)
      fetchPolls(5, newOffset)
    }
  }

  useEffect(() => {
    fetchPolls(5, 0)
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
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">P</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">PollHub</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
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
                  <a href="/login" className="text-gray-700 hover:text-blue-600 text-sm sm:text-base">
                    🔐 Login
                  </a>
                  <a href="/signup" className="bg-blue-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-blue-700 text-sm sm:text-base">
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 All
            </button>
            <button
              onClick={() => setSelectedCategory('GENERAL')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'GENERAL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 General
            </button>
            <button
              onClick={() => setSelectedCategory('SPORTS')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'SPORTS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚽ Sports
            </button>
            <button
              onClick={() => setSelectedCategory('POLITICS')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'POLITICS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏛️ Politics
            </button>
            <button
              onClick={() => setSelectedCategory('ENTERTAINMENT')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'ENTERTAINMENT'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎬 Entertainment
            </button>
            <button
              onClick={() => setSelectedCategory('TECHNOLOGY')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'TECHNOLOGY'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💻 Technology
            </button>
            <button
              onClick={() => setSelectedCategory('EDUCATION')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'EDUCATION'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📚 Education
            </button>
            <button
              onClick={() => setSelectedCategory('HEALTH')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'HEALTH'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏥 Health
            </button>
            <button
              onClick={() => setSelectedCategory('BUSINESS')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'BUSINESS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💼 Business
            </button>
            <button
              onClick={() => setSelectedCategory('TRAVEL')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'TRAVEL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✈️ Travel
            </button>
            <button
              onClick={() => setSelectedCategory('FOOD')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'FOOD'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🍕 Food
            </button>
            <button
              onClick={() => setSelectedCategory('OTHER')}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedCategory === 'OTHER'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔸 Other
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
              <>
                {filteredPolls.map(poll => (
                  <PollCard key={poll.id} poll={poll} onVote={() => fetchPolls()} />
                ))}
                {hasMore && (
                  <div className="text-center mt-6">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
                    >
                      {loadingMore && (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      <span>{loadingMore ? 'Loading...' : 'Load More'}</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
