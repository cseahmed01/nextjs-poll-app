'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create account first
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'An error occurred')
        setLoading(false)
        return
      }

      // If profile image was provided, upload it
      if (profileImage) {
        // Login first to get session
        const loginRes = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        if (loginRes.ok) {
          // Upload profile image
          const formData = new FormData()
          formData.append('profileImage', profileImage)

          await fetch('/api/user/profile-image', {
            method: 'POST',
            body: formData
          })
          // Don't block on image upload failure
        }
      }

      router.push('/login')
    } catch (error) {
      setError('Server error')
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

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center px-4 py-8">
        {/* Form First */}
        <div className="max-w-md w-full mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Join PollHub</h1>
              <p className="text-gray-600">Create your account and start polling</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPEG, PNG, GIF. Max size: 5MB
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Creating Account...' : '🎉 Create Account'}</span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-green-600 hover:text-green-800 font-medium">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Hero Section Below Form */}
        <div className="text-center max-w-xl md:max-w-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Join the Polling Revolution</h2>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">Create impactful polls, connect with your audience, and unlock valuable insights today.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
            <div className="text-center">🎯 Create Engaging Polls</div>
            <div className="text-center">📈 Analyze Responses</div>
            <div className="text-center">🌍 Global Community</div>
          </div>
        </div>
      </div>
    </>
  )
}