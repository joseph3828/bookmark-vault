'use client'

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
  onDelete
}: {
  bookmarks: Bookmark[]
  onDelete: () => void
}) {
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    if (error) {
      alert('Failed to delete')
    } else {
      onDelete()
    }
  }

  if (bookmarks.length === 0) {
    return <p className="text-gray-500 my-4">No bookmarks saved yet.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 my-4">
      {bookmarks.map((bm) => (
        <div key={bm.id} className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white text-black flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg text-blue-600 truncate">
              <a href={bm.url} target="_blank" rel="noopener noreferrer">
                {bm.title}
              </a>
            </h3>
            <p className="text-sm text-gray-600 mt-1">{bm.summary || bm.description}</p>
            
            {bm.tags && bm.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {bm.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
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