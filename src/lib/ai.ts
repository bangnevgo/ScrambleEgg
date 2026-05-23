import ZAI from 'z-ai-web-dev-sdk'
import { ZAIConfig } from 'z-ai-web-dev-sdk'

let zaiInstance: ZAI | null = null

export async function getAI(): Promise<ZAI> {
  if (zaiInstance) return zaiInstance

  // Try loading from .z-ai-config file (local dev)
  try {
    zaiInstance = await ZAI.create()
    return zaiInstance
  } catch {
    // Fallback: read from environment variables (Vercel)
    const config: ZAIConfig = {
      baseUrl: process.env.ZAI_BASE_URL || 'https://opencode.ai/zen/v1',
      apiKey: process.env.ZAI_API_KEY || '',
    }
    if (!config.apiKey) {
      throw new Error('ZAI_API_KEY is not configured. Set it in .env.local or Vercel env vars.')
    }
    // ZAI constructor is private in TS types, but works at runtime
    const ZAIClass = ZAI as unknown as { new(config: ZAIConfig): ZAI }
    zaiInstance = new ZAIClass(config)
    return zaiInstance
  }
}
