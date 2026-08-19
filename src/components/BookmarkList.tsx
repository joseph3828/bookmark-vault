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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [editTags, setEditTags] = useState('')
  const [takeawaysMap, setTakeawaysMap] = useState<Record<string, string>>({})
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    if (error) alert('Failed to delete')
    else onDelete()
  }

  const startEditing = (bm: Bookmark) => {
    setEditingId(bm.id)
    setEditTitle(bm.title)
    setEditSummary(bm.summary || '')
    setEditTags(bm.tags ? bm.tags.join(', ') : '')
  }

  const saveEdit = async (id: string) => {
    const parsedTags = editTags.split(',').map((t) => t.trim()).filter(Boolean)

    const { error } = await supabase
      .from('bookmarks')
      .update({
        title: editTitle,
        summary: editSummary,
        tags: parsedTags,
      })
      .eq('id', id)

    if (error) {
      alert('Failed to update bookmark')
    } else {
      setEditingId(null)
      onDelete() // Refresh list
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

  const getFaviconUrl = (websiteUrl: string) => {
    try {
      const domain = new URL(websiteUrl).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return ''
    }
  }

  if (bookmarks.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 my-6 text-center">No bookmarks match your criteria.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 my-4">
      {bookmarks.map((bm) => (
        <div 
          key={bm.id} 
          className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex flex-col justify-between transition-colors"
        >
          {editingId === bm.id ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded text-xs h-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="tags (comma separated)"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  onClick={() => setEditingId(null)} 
                  className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => saveEdit(bm.id)} 
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={getFaviconUrl(bm.url)}
                  alt=""
                  className="w-5 h-5 rounded-sm object-contain"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                />
                <h3 className="font-semibold text-base text-blue-600 dark:text-blue-400 truncate flex-1">
                  <a href={bm.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {bm.title}
                  </a>
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">{bm.summary || bm.description}</p>
              
              {bm.tags && bm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {bm.tags.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => onTagClick(tag)}
                      className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs rounded-full font-medium transition"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {/* AI Key Takeaways Section */}
              {takeawaysMap[bm.id] ? (
                <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Key Takeaways:</p>
                  {takeawaysMap[bm.id]}
                </div>
              ) : (
                <button
                  onClick={() => fetchTakeaways(bm)}
                  disabled={loadingMap[bm.id]}
                  className="mt-3 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium flex items-center gap-1 transition"
                >
                  {loadingMap[bm.id] ? '✨ Generating...' : '✨ AI Key Takeaways'}
                </button>
              )}
            </div>
          )}

          <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
            <span>{new Date(bm.created_at).toLocaleDateString()}</span>
            <div className="flex gap-3">
              {editingId !== bm.id && (
                <button onClick={() => startEditing(bm)} className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">Edit</button>
              )}
              <button onClick={() => handleDelete(bm.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}