'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BookmarkImporter({ onImportComplete }: { onImportComplete: () => void }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const supabase = createClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setStatus('Parsing bookmark file...')

    try {
      const text = await file.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'text/html')
      const anchorElements = Array.from(doc.querySelectorAll('a'))

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please log in first.')
        setLoading(false)
        return
      }

      // Extract valid HTTP links (up to 20 for rate limit safety)
      const parsedLinks = anchorElements
        .map((a) => ({
          url: a.href,
          title: a.textContent?.trim() || a.href,
          description: 'Imported from browser export',
          summary: 'Browser bookmark import',
          tags: ['imported'],
          user_id: user.id,
        }))
        .filter((bm) => bm.url.startsWith('http'))
        .slice(0, 20)

      if (parsedLinks.length === 0) {
        alert('No valid links found in this HTML file.')
        setLoading(false)
        return
      }

      setStatus(`Saving ${parsedLinks.length} bookmarks...`)

      const { error } = await supabase.from('bookmarks').insert(parsedLinks)
      if (error) throw error

      alert(`Successfully imported ${parsedLinks.length} bookmarks!`)
      onImportComplete()
    } catch (err: any) {
      alert(err.message || 'Error importing file')
    } finally {
      setLoading(false)
      setStatus('')
      e.target.value = ''
    }
  }

  return (
    <div className="my-4 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 text-center">
      <label className="cursor-pointer font-medium text-sm text-blue-600 hover:text-blue-800">
        {loading ? status : '📁 Import Chrome / Browser Bookmarks (.html)'}
        <input
          type="file"
          accept=".html"
          onChange={handleFileUpload}
          disabled={loading}
          className="hidden"
        />
      </label>
    </div>
  )
}