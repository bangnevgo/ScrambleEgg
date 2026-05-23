import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json()
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 })
    }

    const itemList = items.map(
      (item: any) => `- [${item.category.toUpperCase()}] "${item.text}" (AI note: ${item.aiNote})`
    ).join('\n')

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Kamu adalah AI life coach dalam app "Scramble Egg". Tugasmu: analisis semua item user, lalu buat weekly digest yang personal, insightful, dan bikin semangat.

RESPON HARUS DALAM FORMAT JSON PERSIS INI (tanpa markdown, tanpa backtick):
{
  "summary": "Ringkasan situasi user minggu ini dalam 2-3 kalimat yang personal dan insightful. Pakai bahasa Indonesia yang casual tapi meaningful.",
  "priorities": [
    "Prioritas 1: deskripsi singkat dan actionable",
    "Prioritas 2: deskripsi singkat dan actionable", 
    "Prioritas 3: deskripsi singkat dan actionable"
  ],
  "mood": "Emoji yang merepresentasikan mood keseluruhan + 1 kalimat komentar tentang vibe-nya"
}

Jangan terlalu formal — ini app yang fun dan personal. Bikin user merasa dipahami dan disemangati.`,
        },
        {
          role: 'user',
          content: `Ini semua item saya:\n${itemList}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    const raw = completion.choices?.[0]?.message?.content || ''
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('Digest API error:', error)
    return NextResponse.json(
      {
        summary: 'Wah, belum bisa baca chaos-mu kali ini — tapi tetap semangat ya! 🍳',
        priorities: ['Dump lebih banyak ide dulu!', 'Coba lagi nanti', 'Tetap produktif!'],
        mood: '🍳 Siap scrambled!',
      },
      { status: 200 }
    )
  }
}
