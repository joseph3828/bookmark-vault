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

  const getFaviconUrl = (websiteUrl: string) => {
    try {
      const domain = new URL(websiteUrl).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return ''
    }
  }

  if (bookmarks.length === 0) {
    return <p className="text-gray-500 my-6 text-center">No bookmarks match your criteria.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 my-4">
      {bookmarks.map((bm) => (
        <div key={bm.id} className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white text-black flex flex-col justify-between">
          {editingId === bm.id ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="px-2 py-1 border rounded text-sm font-semibold"
              />
              <textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                className="px-2 py-1 border rounded text-xs h-16"
              />
              <input
                type="text"
                placeholder="tags (comma separated)"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="px-2 py-1 border rounded text-xs"
              />
              <div className="flex gap-2 justify-end mt-2">
                <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 bg-gray-200 rounded">Cancel</button>
                <button onClick={() => saveEdit(bm.id)} className="text-xs px-2 py-1 bg-blue-600 text-white rounded">Save</button>
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
            </div>
          )}

          <div className="mt-4 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
            <span>{new Date(bm.created_at).toLocaleDateString()}</span>
            <div className="flex gap-3">
              {editingId !== bm.id && (
                <button onClick={() => startEditing(bm)} className="text-blue-500 hover:text-blue-700 font-medium">Edit</button>
              )}
              <button onClick={() => handleDelete(bm.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}