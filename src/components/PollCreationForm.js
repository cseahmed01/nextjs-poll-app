'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { pollTemplates, getTemplateById } from '@/lib/pollTemplates'

export default function PollCreationForm({
  onPollCreated,
  onCancel,
  mode = 'inline', // 'inline', 'modal', 'page'
  initialData = {}
}) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    category: initialData.category || 'GENERAL',
    tags: initialData.tags || '',
    expiresAt: initialData.expiresAt || '',
    scheduledAt: initialData.scheduledAt || '',
    options: initialData.options || ['', '']
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTemplates, setShowTemplates] = useState(mode === 'page')

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }))
    }
  }

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }))
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }))
  }

  const selectTemplate = (templateId) => {
    const template = getTemplateById(templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.title,
        category: template.category,
        options: template.options
      }))
      if (mode !== 'page') {
        setShowTemplates(false)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const filteredOptions = formData.options.filter(opt => opt.trim())
    if (!formData.title.trim() || filteredOptions.length < 2) {
      setError('Question and at least 2 options required')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          category: formData.category,
          tags: formData.tags.trim(),
          expiresAt: formData.expiresAt || null,
          scheduledAt: formData.scheduledAt || null,
          options: filteredOptions
        })
      })

      if (res.ok) {
        // Reset form
        setFormData({
          title: '',
          category: 'GENERAL',
          tags: '',
          expiresAt: '',
          scheduledAt: '',
          options: ['', '']
        })
        setShowTemplates(mode === 'page')
        if (onPollCreated) onPollCreated()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create poll')
      }
    } catch (err) {
      setError('Network error')
    }
    setLoading(false)
  }

  if (!session) return null

  const containerClasses = {
    inline: "bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden",
    modal: "bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto",
    page: "bg-white rounded-2xl shadow-xl p-8"
  }

  const formClasses = {
    inline: "space-y-5",
    modal: "p-8 space-y-6",
    page: "space-y-6"
  }

  return (
    <div className={containerClasses[mode]}>
      {mode === 'modal' && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create New Poll</h3>
              <p className="text-sm text-gray-600">Share your question with the community</p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className={formClasses[mode]}>
        {mode === 'inline' && (
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create New Poll</h3>
                <p className="text-sm text-gray-600">Share your question with the community</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Templates Toggle (for inline mode) */}
        {mode === 'inline' && !showTemplates && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowTemplates(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-2"
            >
              <span>🚀</span>
              <span>Use Quick Template</span>
            </button>
          </div>
        )}

        {/* Template Selection */}
        {(showTemplates || mode === 'page') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                🚀 Quick Start Templates
              </label>
              {mode === 'inline' && (
                <button
                  type="button"
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  Hide
                </button>
              )}
            </div>
            <div className={`grid gap-3 ${
              mode === 'page' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5' :
              mode === 'modal' ? 'grid-cols-2 md:grid-cols-3' :
              'grid-cols-2'
            }`}>
              {pollTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => selectTemplate(template.id)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-base">{template.icon}</span>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{template.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{template.title}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Click a template to auto-fill your poll</p>
          </div>
        )}

        {/* Poll Question */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Poll Question *
          </label>
          <input
            type="text"
            placeholder="What's your question?"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="GENERAL">📊 General</option>
            <option value="SPORTS">⚽ Sports</option>
            <option value="POLITICS">🏛️ Politics</option>
            <option value="ENTERTAINMENT">🎬 Entertainment</option>
            <option value="TECHNOLOGY">💻 Technology</option>
            <option value="EDUCATION">📚 Education</option>
            <option value="HEALTH">🏥 Health</option>
            <option value="BUSINESS">💼 Business</option>
            <option value="TRAVEL">✈️ Travel</option>
            <option value="FOOD">🍕 Food</option>
            <option value="OTHER">🔸 Other</option>
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tags (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. fun, survey, opinion (comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500">Separate tags with commas</p>
        </div>

        {/* Expiration and Schedule */}
        <div className={`grid gap-4 ${mode === 'inline' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ⏰ Expiration Date & Time (optional)
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">When voting should stop</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              📅 Schedule Release (optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">When poll becomes visible</p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Options *
          </label>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[40px]"
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove option"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {formData.options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Option
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className={`flex ${mode === 'inline' ? 'justify-end space-x-3 pt-4 border-t border-gray-100' : 'justify-end space-x-3 pt-6 border-t border-gray-100'}`}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {loading ? 'Creating...' : 'Post Poll'}
          </button>
        </div>
      </form>
    </div>
  )
}