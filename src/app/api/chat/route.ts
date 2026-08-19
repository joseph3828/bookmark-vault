import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request: Request) {
  try {
    const { query, bookmarks } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const context = bookmarks
      .map(
        (bm: any) =>
          `- Title: ${bm.title}\n  URL: ${bm.url}\n  Summary: ${bm.summary}\n  Tags: ${bm.tags?.join(', ')}`
      )
      .join('\n\n')

    const prompt = `You are an AI assistant for a user's personal bookmark vault. 
    Answer the user's question based ONLY on their saved bookmarks provided below. If the answer isn't in their bookmarks, politely tell them so.

    Bookmarks Context:
    ${context}

    User Question: "${query}"`

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    })

    return NextResponse.json({ reply: response.text })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to answer question' },
      { status: 500 }
    )
  }
}