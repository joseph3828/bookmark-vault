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
  onDelete,
  onTagClick
}: {
  bookmarks: Bookmark[]
  onDelete: () => void
  onTagClick: (tag: string) => void
}) {
  const supabase = createClient()

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