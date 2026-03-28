import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return new Response(null, { status: 401 })

  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
  })

  if (!proposal) return new Response(null, { status: 404 })
  if (proposal.userId !== session.user.id) return new Response(null, { status: 403 })
  if (!proposal.pdfData) return new Response(null, { status: 404 })

  return new Response(proposal.pdfData, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${proposal.pdfFileName || 'proposta.pdf'}"`,
    },
  })
}
