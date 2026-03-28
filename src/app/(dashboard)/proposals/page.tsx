import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ProposalList from '@/components/proposals/proposal-list'

export default async function ProposalsPage() {
  const session = await auth()
  if (!session) return null

  const proposals = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  })

  const data = proposals.map(p => ({
    id: p.id,
    clientName: p.client.name,
    modality: p.modality,
    value: Number(p.value),
    proposalDate: p.proposalDate.toISOString(),
    status: p.status,
    pdfFileName: p.pdfFileName,
    createdAt: p.createdAt.toISOString(),
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Propostas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.length} proposta{data.length !== 1 ? 's' : ''} gerada{data.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/proposals/new"
          className="bg-[#0A1628] hover:bg-[#112040] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          + Nova Proposta
        </Link>
      </div>

      <ProposalList proposals={data} />
    </div>
  )
}
