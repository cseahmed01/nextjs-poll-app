'use client'

import { useState, useEffect } from 'react'
import PollCreationForm from './PollCreationForm'

export default function PollCreationModal({ isOpen, onClose, onPollCreated }) {
  const [isClosing, setIsClosing] = useState(false)

  const handlePollCreated = () => {
    setIsClosing(true)
    // Small delay to allow closing animation
    setTimeout(() => {
      onPollCreated()
      onClose()
      setIsClosing(false)
    }, 150)
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 150)
  }

  // Reset closing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen && !isClosing) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-light transition-opacity duration-200 ${
          isClosing ? 'bg-opacity-10' : 'bg-opacity-50'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className={`relative w-full max-w-none sm:max-w-2xl bg-white rounded-none sm:rounded-2xl shadow-2xl transform transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          <PollCreationForm
            mode="modal"
            onPollCreated={handlePollCreated}
            onCancel={handleClose}
          />
        </div>
      </div>
    </div>
  )
}