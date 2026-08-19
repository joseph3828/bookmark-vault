'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddBookmarkForm({ onBookmarkAdded }: { onBookmarkAdded: () => void }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please log in to add bookmarks.')
        setLoading(false)
        return
      }

      // Simple baseline title logic (can replace with AI processing route)
      const domain = new URL(url).hostname.replace('www.', '')
      const title = domain.charAt(0).toUpperCase() + domain.slice(1)

      const { error } = await supabase.from('bookmarks').insert({
        url,
        title,
        description: 'Saved link',
        summary: 'Auto-saved resource',
        tags: ['resource'],
        user_id: user.id
      })

      if (error) throw error

      setUrl('')
      onBookmarkAdded()
    } catch (err: any) {
      alert(err.message || 'Error adding bookmark')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 my-4">
      <input
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Add Link'}
      </button>
    </form>
  )
}