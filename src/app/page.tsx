'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AddBookmarkForm from '@/components/AddBookmarkForm'
import BookmarkList, { Bookmark } from '@/components/BookmarkList'
import Auth from '@/components/Auth'
import { User } from '@supabase/supabase-js'
import VaultChat from '@/components/VaultChat'
import BookmarkImporter from '@/components/BookmarkImporter'
import ThemeToggle from '@/components/ThemeToggle'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const supabase = createClient()

  const checkUserAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setBookmarks(data)
    } else {
      setBookmarks([])
    }
  }

  useEffect(() => {
    checkUserAndFetch()
  }, [])

  const filteredBookmarks = bookmarks.filter((bm) => {
    const matchesSearch =
      bm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bm.summary && bm.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      bm.url.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTag = selectedTag
      ? bm.tags && bm.tags.includes(selectedTag)
      : true

    return matchesSearch && matchesTag
  })

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* Header Row with Theme Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Resource Vault</h1>
          <p className="text-gray-600 dark:text-gray-400">Save, search, and summarize your links.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">{user.email}</span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  setUser(null)
                  setBookmarks([])
                }}
                className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {!user ? (
        <Auth onAuthSuccess={checkUserAndFetch} />
      ) : (
        <>
          <AddBookmarkForm onBookmarkAdded={checkUserAndFetch} />
          <BookmarkImporter onImportComplete={checkUserAndFetch} />
          
          {/* Search Bar & Active Tag Filter */}
          <div className="my-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {selectedTag && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-xs px-3 py-1.5 rounded-full font-medium">
                <span>Filter: #{selectedTag}</span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="font-bold hover:text-blue-900 dark:hover:text-blue-100 ml-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <BookmarkList
            bookmarks={filteredBookmarks}
            onDelete={checkUserAndFetch}
            onTagClick={(tag) => setSelectedTag(tag)}
          />

          <VaultChat bookmarks={bookmarks} />
        </>
      )}
    </main>
  )
}