'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PollCreationForm from '@/components/PollCreationForm'

export default function CreatePoll() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/login')
  }, [session, status, router])

  const handlePollCreated = () => {
    router.push('/')
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
                <h1 className="text-xl font-bold text-gray-900">Create Poll</h1>
                <p className="text-sm text-gray-600">Share your question with the community</p>
              </div>
            </div>
            <a href="/dashboard" className="text-gray-700 hover:text-blue-600">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <PollCreationForm
            mode="page"
            onPollCreated={handlePollCreated}
          />
        </div>
      </main>
    </div>
  )
}