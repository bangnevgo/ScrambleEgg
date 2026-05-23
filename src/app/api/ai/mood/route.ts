import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(req: NextRequest) {
  try {
    const { items, scene } = await req.json()
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 })
    }
    if (!scene) {
      return NextResponse.json({ error: 'Scene is required' }, { status: 400 })
    }

    const itemList = items.map(
      (item: any) => `- [${item.category.toUpperCase()}] "${item.text}"`
    ).join('\n')

    const sceneDescriptions: Record<string, string> = {
      'me-today': 'snapshot kondisi hari ini — jika banyak pending/stress, gambar orang tenggelam di telur orak-arik; jika santai, gambar orang santai makan telur',
      'me-this-week': 'recap chaos minggu ini — visualisasi minggu yang berantakan tapi lucu',
      'my-brain': 'visualisasi isi kepala — otak yang penuh ide bertebaran seperti telur pecah',
      'my-parking-lot': 'semua mimpi yang diparkir — aesthetic lo-fi night, mimpi yang indah tapi belum kesampaian',
      'done-party': 'celebration art — pesta telur yang meriah karena banyak yang selesai',
    }

    const zai = await ZAI.create()

    // Step 1: Generate image prompt
    const promptCompletion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Kamu adalah AI yang bikin prompt gambar lucu dan relatable untuk app "Scramble Egg". 

Buat prompt yang:
- Style: flat chibi illustration / cute comic strip / lo-fi aesthetic (sesuai scene)
- Karakter: telur lucu yang anthropomorphic (karakter utama app)
- Tone: lucu, relatable, shareable di social media
- Warna: warm, vibrant, eye-catching
- NO TEXT in the image

Scene: ${sceneDescriptions[scene] || scene}

Item user untuk konteks:
${itemList}

RESPON DALAM FORMAT JSON (tanpa markdown, tanpa backtick):
{
  "prompt": "detailed image generation prompt in English, very specific about the illustration style, characters, scene, colors, mood. Include: 'flat chibi illustration style, cute anthropomorphic egg character, vibrant warm colors, clean background, no text, humorous and relatable'",
  "caption": "Caption lucu untuk Instagram/TikTok dalam Bahasa Indonesia, 1-2 kalimat yang relate dan bikin ngakak",
  "hashtags": "#ScrambleEgg #ProductivityMood #ChaosOrganized dan hashtag yang relate ke konten user"
}`,
        },
        {
          role: 'user',
          content: `Scene: ${scene}. Items:\n${itemList}`,
        },
      ],
      temperature: 0.9,
      max_tokens: 400,
    })

    const raw = promptCompletion.choices?.[0]?.message?.content || ''
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    // Step 2: Generate image using Pollinations AI
    const encodedPrompt = encodeURIComponent(parsed.prompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true`

    return NextResponse.json({
      imageUrl,
      caption: parsed.caption,
      hashtags: parsed.hashtags,
    })
  } catch (error: any) {
    console.error('Mood API error:', error)
    return NextResponse.json(
      {
        imageUrl: '',
        caption: 'Gagal generate mood — tapi tetap semangat! 🍳',
        hashtags: '#ScrambleEgg',
      },
      { status: 200 }
    )
  }
}
