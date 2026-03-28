import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return new NextResponse(null, { status: 401 })

  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
  })

  if (!proposal) return new NextResponse(null, { status: 404 })
  if (proposal.userId !== session.user.id) return new NextResponse(null, { status: 403 })
  if (!proposal.pdfData) return new NextResponse(null, { status: 404 })

  // Extract ArrayBuffer from Prisma Bytes (Buffer) for proper BodyInit typing
  const buf = Buffer.from(proposal.pdfData)
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${proposal.pdfFileName || 'proposta.pdf'}"`,
    },
  })
}
