'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddBookmarkForm({ onBookmarkAdded }: { onBookmarkAdded: () => void }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    setStatusText('Generating AI summary...')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please log in to add bookmarks.')
        setLoading(false)
        return
      }

      // 1. Call AI API route
      const aiResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      let aiData = { title: url, summary: 'Saved resource', tags: ['resource'] }
      
      if (aiResponse.ok) {
        aiData = await aiResponse.json()
      }

      setStatusText('Saving to vault...')

      // 2. Save result in Supabase
      const { error } = await supabase.from('bookmarks').insert({
        url,
        title: aiData.title || url,
        description: aiData.summary,
        summary: aiData.summary,
        tags: aiData.tags || ['web'],
        user_id: user.id
      })

      if (error) throw error

      setUrl('')
      onBookmarkAdded()
    } catch (err: any) {
      alert(err.message || 'Error processing link')
    } finally {
      setLoading(false)
      setStatusText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 my-4">
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'AI Analyzing...' : 'Add Link'}
        </button>
      </div>
      {statusText && <p className="text-xs text-blue-600 font-medium animate-pulse">{statusText}</p>}
    </form>
  )
}