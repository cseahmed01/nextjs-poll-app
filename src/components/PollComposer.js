'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import PollCreationModal from './PollCreationModal'

export default function PollComposer({ onPollCreated }) {
  const { data: session } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePollCreated = () => {
    if (onPollCreated) onPollCreated()
  }

  if (!session) return null

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-3 sm:p-4 rounded-lg transition-all duration-200 group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>{session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-gray-600 text-base font-medium">What&apos;s your question?</div>
              <div className="text-gray-400 text-sm">Click to create a new poll</div>
            </div>
            <div className="flex items-center space-x-2 text-blue-600 group-hover:text-blue-700 transition-colors">
              <span className="font-medium hidden sm:inline">Create Poll</span>
              <svg className="w-5 h-5 sm:w-5 sm:h-5 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <PollCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPollCreated={handlePollCreated}
      />
    </>
  )
}