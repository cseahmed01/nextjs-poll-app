'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { pollTemplates, getTemplateById } from '@/lib/pollTemplates'

export default function CreatePoll() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [tags, setTags] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/login')
  }, [session, status, router])

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const selectTemplate = (templateId) => {
    const template = getTemplateById(templateId)
    if (template) {
      setTitle(template.title)
      setCategory(template.category)
      setOptions(template.options)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const filteredOptions = options.filter(opt => opt.trim())
    if (!title.trim() || filteredOptions.length < 2) {
      setError('Title and at least 2 options required')
      return
    }

    const res = await fetch('/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        category,
        tags: tags.trim(),
        expiresAt: expiresAt || null,
        scheduledAt: scheduledAt || null,
        options: filteredOptions
      })
    })

    if (res.ok) {
      router.push('/')
    } else {
      try {
        const data = await res.json()
        setError(data.error || 'An error occurred')
      } catch {
        setError('Server error')
      }
    }
  }

  if (status === 'loading') return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Poll</h1>
            <p className="text-gray-600">Share your question with the community</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🚀 Quick Start Templates (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {pollTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => selectTemplate(template.id)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{template.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{template.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">{template.title}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Click a template to auto-fill your poll</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poll Question
              </label>
              <input
                type="text"
                placeholder="What's your question?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. fun, survey, opinion (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏰ Expiration Date & Time (optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">When voting should stop</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Schedule Release (optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">When poll becomes visible</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Options
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    {options.length > 2 && (
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

              <button
                type="button"
                onClick={addOption}
                className="mt-4 w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Option
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🚀 Create Poll
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}