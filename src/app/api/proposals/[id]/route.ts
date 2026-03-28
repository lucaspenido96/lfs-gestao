import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
    include: { client: true },
  })

  if (!proposal) return Response.json({ error: 'Not found' }, { status: 404 })
  if (proposal.userId !== session.user.id) return Response.json({ error: 'Forbidden' }, { status: 403 })

  return Response.json({
    ...proposal,
    value: Number(proposal.value),
    financialCharges: Number(proposal.financialCharges),
    iof: Number(proposal.iof),
    successFee: Number(proposal.successFee),
    pdfData: undefined,
  })
}
