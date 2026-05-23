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
          content: `Kamu adalah AI vision board creator dalam app "Scramble Egg". Tugasmu: analisis semua item user dan buat vision board yang powerful, personal, dan inspiring.

RESPON HARUS DALAM FORMAT JSON PERSIS INI (tanpa markdown, tanpa backtick):
{
  "headline": "Headline powerful yang merepresentasikan visi/arah hidup user — 1 kalimat yang kuat dan memorable",
  "themes": ["Tema besar 1", "Tema besar 2", "Tema besar 3", "Tema besar 4", "Tema besar 5"],
  "wordCloud": ["kata1", "kata2", "kata3", "...minimal 20 kata yang mewakili isi kepala user, termasuk kata unik dan spesifik dari item-itemnya"],
  "affirmations": ["Afirmasi personal 1", "Afirmasi personal 2", "Afirmasi personal 3"],
  "dailyMantra": "Satu kalimat mantra yang bisa dipandang tiap pagi — personal, powerful, dan relate ke kehidupan user"
}

Semua dalam Bahasa Indonesia. Buat personal berdasarkan konten itemnya, bukan generic. Bikin user merasa "WAH ini beneran tentang gue!"`,
        },
        {
          role: 'user',
          content: `Ini semua item saya:\n${itemList}`,
        },
      ],
      temperature: 0.85,
      max_tokens: 600,
    })

    const raw = completion.choices?.[0]?.message?.content || ''
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('Vision API error:', error)
    return NextResponse.json(
      {
        headline: 'Chaos-mu punya cerita yang indah 🍳',
        themes: ['Kreativitas', 'Produktivitas', 'Mimpi', 'Pertumbuhan', 'Eksplorasi'],
        wordCloud: ['ide', 'semangat', 'mimpi', 'kerja', 'kreativitas', 'fokus', 'tumbuh', 'belajar', 'eksplorasi', 'berani', 'coba', 'buat', 'pikir', 'rasa', 'mau', 'bisa', 'mulai', 'lanjut', 'jadi', 'nyata'],
        affirmations: ['Aku punya ide yang berharga', 'Setiap langkah kecil itu progress', 'Chaos adalah proses menuju kejelasan'],
        dailyMantra: 'Hari ini aku pilih berkembang, bukan mempersulit 🌟',
      },
      { status: 200 }
    )
  }
}
