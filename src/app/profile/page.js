'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profileImage, setProfileImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    birthday: ''
  })
  const [updating, setUpdating] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/login')
  }, [session, status, router])

  useEffect(() => {
    if (session?.user) {
      fetchProfileData()
    }
  }, [session])

  const fetchProfileData = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setProfileData({
          name: data.user.name || '',
          bio: data.user.bio || '',
          location: data.user.location || '',
          website: data.user.website || '',
          birthday: data.user.birthday ? new Date(data.user.birthday).toISOString().split('T')[0] : ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setMessage('Invalid file type. Only JPEG, PNG, and GIF are allowed.')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size too large. Maximum 5MB allowed.')
      return
    }

    setUploading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('profileImage', file)

    try {
      const res = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Profile image updated successfully!')
        setProfileImage(data.imageUrl)
        // Update session to reflect new image
        await update({ image: data.imageUrl })
      } else {
        setMessage(data.error || 'Upload failed')
      }
    } catch (error) {
      setMessage('Upload failed')
    }

    setUploading(false)
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setProfileMessage('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      const data = await res.json()

      if (res.ok) {
        setProfileMessage('Profile updated successfully!')
        // Update session if name changed
        if (profileData.name !== session.user.name) {
          await update({ name: profileData.name })
        }
      } else {
        setProfileMessage(data.error || 'Failed to update profile')
      }
    } catch (error) {
      setProfileMessage('Failed to update profile')
    }

    setUpdating(false)
  }

  const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U'
  }

  if (status === 'loading') return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-600">Welcome back, {session.user.name}!</p>
              </div>
            </div>
            <a href="/dashboard" className="text-gray-700 hover:text-blue-600">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Profile Image Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Picture</h2>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {profileImage || session?.user?.image ? (
                  <img
                    src={profileImage || session.user.image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getUserInitial(session?.user?.name)
                )}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPEG, PNG, GIF. Max size: 5MB
                </p>
              </div>

              {uploading && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading...</span>
                </div>
              )}

              {message && (
                <div className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>

            {profileMessage && (
              <div className={`mb-4 text-sm ${profileMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{profileData.bio.length}/500 characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, Country"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                    maxLength={200}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birthday
                </label>
                <input
                  type="date"
                  value={profileData.birthday}
                  onChange={(e) => setProfileData({...profileData, birthday: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  max={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">You must be at least 13 years old</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={session?.user?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {updating ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}