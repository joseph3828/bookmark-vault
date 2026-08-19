'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AddBookmarkForm from '@/components/AddBookmarkForm'
import BookmarkList, { Bookmark } from '@/components/BookmarkList'
import Auth from '@/components/Auth'
import { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setBookmarks([])
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Resource Vault</h1>
          <p className="text-gray-600">Save and organize your web links.</p>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {!user ? (
        <Auth onAuthSuccess={checkUserAndFetch} />
      ) : (
        <>
          <AddBookmarkForm onBookmarkAdded={checkUserAndFetch} />
          <BookmarkList bookmarks={bookmarks} onDelete={checkUserAndFetch} />
        </>
      )}
    </main>
  )
}