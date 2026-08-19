import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const prompt = `Analyze this web URL: "${url}". 
    Provide a JSON response with:
    1. "title": A concise, clear title for what this page/website is.
    2. "summary": A 1-2 sentence description of what the content or product is about.
    3. "tags": An array of 2 to 4 relevant keyword tags (e.g., ["coding", "ai", "react"]).

    Return ONLY valid raw JSON with no Markdown code block wrapping.`

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash', // <-- UPDATED HERE
      contents: prompt,
    })

    const text = response.text || '{}'
    const cleanText = text.replace(/```json|```/g, '').trim()
    const parsedData = JSON.parse(cleanText)

    return NextResponse.json(parsedData)
  } catch (error: any) {
    console.error('AI Processing Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI summary' },
      { status: 500 }
    )
  }
}