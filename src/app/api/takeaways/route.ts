import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request: Request) {
  try {
    const { url, title, summary } = await request.json()

    const prompt = `Based on this webpage title: "${title}", URL: "${url}", and summary: "${summary}", generate 3 concise bullet points highlighting key takeaways or actionable insights. Return ONLY 3 bullet points starting with standard bullets.`

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    })

    return NextResponse.json({ takeaways: response.text })
  } catch (error: any) {
    console.error('Takeaway API Error:', error)
    return NextResponse.json({ error: 'Failed to generate takeaways' }, { status: 500 })
  }
}