'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (result.error) {
      setError('Invalid credentials')
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <Link
              href="/"
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">P</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">PollHub</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-8">
        {/* Form First */}
        <div className="max-w-md w-full mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Signing In...' : '🚀 Sign In'}</span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign up here
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Hero Section Below Form */}
        <div className="text-center max-w-xl md:max-w-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Discover the Power of Polling</h2>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">Engage your audience, gather insights, and make informed decisions with PollHub.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
            <div className="text-center">📊 Real-time Analytics</div>
            <div className="text-center">👥 Community Engagement</div>
            <div className="text-center">🚀 Data-Driven Insights</div>
          </div>
        </div>
      </div>
    </>
  )
}