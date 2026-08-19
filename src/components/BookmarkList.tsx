'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Bookmark {
  id: string
  url: string
  title: string
  description?: string
  summary?: string
  tags?: string[]
  created_at: string
}

export default function BookmarkList({
  bookmarks,
  onDelete,
  onTagClick
}: {
  bookmarks: Bookmark[]
  onDelete: () => void
  onTagClick: (tag: string) => void
}) {
  const supabase = createClient()
  const [takeawaysMap, setTakeawaysMap] = useState<Record<string, string>>({})
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    if (error) alert('Failed to delete')
    else onDelete()
  }

  const getFaviconUrl = (websiteUrl: string) => {
    try {
      const domain = new URL(websiteUrl).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return ''
    }
  }

  const fetchTakeaways = async (bm: Bookmark) => {
    setLoadingMap((prev) => ({ ...prev, [bm.id]: true }))
    try {
      const res = await fetch('/api/takeaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: bm.url, title: bm.title, summary: bm.summary }),
      })
      const data = await res.json()
      if (res.ok) {
        setTakeawaysMap((prev) => ({ ...prev, [bm.id]: data.takeaways }))
      } else {
        alert(data.error || 'Could not fetch takeaways')
      }
    } catch {
      alert('Error connecting to server')
    } finally {
      setLoadingMap((prev) => ({ ...prev, [bm.id]: false }))
    }
  }

  if (bookmarks.length === 0) {
    return <p className="text-gray-500 my-6 text-center">No bookmarks match your criteria.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 my-4">
      {bookmarks.map((bm) => (
        <div key={bm.id} className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white text-black flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img
                src={getFaviconUrl(bm.url)}
                alt=""
                className="w-5 h-5 rounded-sm object-contain"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
              />
              <h3 className="font-semibold text-base text-blue-600 truncate flex-1">
                <a href={bm.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {bm.title}
                </a>
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{bm.summary || bm.description}</p>
            
            {bm.tags && bm.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {bm.tags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => onTagClick(tag)}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs rounded-full font-medium transition"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* AI Key Takeaways Section */}
            {takeawaysMap[bm.id] ? (
              <div className="mt-3 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 whitespace-pre-line">
                <p className="font-semibold text-gray-900 mb-1">Key Takeaways:</p>
                {takeawaysMap[bm.id]}
              </div>
            ) : (
              <button
                onClick={() => fetchTakeaways(bm)}
                disabled={loadingMap[bm.id]}
                className="mt-3 text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
              >
                {loadingMap[bm.id] ? '✨ Generating...' : '✨ AI Key Takeaways'}
              </button>
            )}
          </div>

          <div className="mt-4 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
            <span>{new Date(bm.created_at).toLocaleDateString()}</span>
            <button
              onClick={() => handleDelete(bm.id)}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}