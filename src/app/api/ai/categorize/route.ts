import { NextRequest, NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const zai = await getAI()
    const completion = await zai.chat.completions.create({
      model: 'deepseek-v4-flash-free',
      messages: [
        {
          role: 'system',
          content: `Kamu adalah AI asisten untuk app "Scramble Egg" — app untuk menampung ide dan task yang berantakan. 
Tugasmu: analisis teks yang user dump, lalu kategorikan dan beri catatan singkat.

Kategori yang tersedia (PILIH SATU):
- "ide" → kalau ini ide baru, konsep, inspirasi, atau pemikiran kreatif
- "task" → kalau ini hal yang harus dikerjakan, action item, to-do
- "pending" → kalau ini sesuatu yang menunggu, belum jelas, atau butuh info lebih
- "parking" → kalau ini ide jangka panjang, mimpi, atau hal yang belum waktunya sekarang

RESPON HARUS DALAM FORMAT JSON PERSIS INI (tanpa markdown, tanpa backtick):
{"category":"ide","note":"catatan singkat yang insightful dan personal dalam bahasa Indonesia, 1-2 kalimat"}

Catatan harus singkat tapi meaningful — bisa jadi saran, insight, atau komentar yang bikin user senyum.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const raw = completion.choices?.[0]?.message?.content || ''
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const validCategories = ['ide', 'task', 'pending', 'parking']
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'pending'
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('Categorize API error:', error)
    return NextResponse.json(
      { category: 'pending', note: 'Hmm, belum bisa kategorikan ini — tapi tenang, tetap tersimpan! 🍳' },
      { status: 200 }
    )
  }
}
