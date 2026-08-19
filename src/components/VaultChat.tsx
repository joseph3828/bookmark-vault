'use client'

import { useState } from 'react'
import { Bookmark } from './BookmarkList'

export default function VaultChat({ bookmarks }: { bookmarks: Bookmark[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [loading, setLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const userText = query
    setQuery('')
    setMessages((prev) => [...prev, { role: 'user', text: userText }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, bookmarks }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.reply }])
      } else {
        setMessages((prev) => [...prev, { role: 'ai', text: data.error || 'Something went wrong.' }])
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Error connecting to server.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg font-medium hover:bg-blue-700 flex items-center gap-2"
      >
        💬 Ask My Vault
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col h-96 z-50 text-black">
      <div className="p-3 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-2xl">
        <h3 className="font-semibold text-sm">Ask My Vault</h3>
        <button onClick={() => setIsOpen(false)} className="text-xs hover:opacity-75">✕</button>
      </div>

      <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2 text-sm">
        {messages.length === 0 && (
          <p className="text-gray-400 text-xs text-center my-auto">
            Ask questions about your saved links (e.g., "What articles do I have about React?")
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[85%] ${
              m.role === 'user'
                ? 'bg-blue-600 text-white self-end'
                : 'bg-gray-100 text-gray-800 self-start'
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <p className="text-xs text-gray-400 italic">Thinking...</p>}
      </div>

      <form onSubmit={handleSend} className="p-2 border-t flex gap-2">
        <input
          type="text"
          placeholder="Ask a question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}