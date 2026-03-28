import { auth } from '@/lib/auth'
import { extractProposalFromImage } from '@/lib/claude'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { imageBase64, mimeType } = await req.json()
    if (!imageBase64) {
      return Response.json({ error: 'imageBase64 required' }, { status: 400 })
    }

    const result = await extractProposalFromImage(imageBase64, mimeType)
    return Response.json(result)
  } catch (error) {
    console.error('Extract error:', error)
    return Response.json({ error: 'Extraction failed' }, { status: 500 })
  }
}
