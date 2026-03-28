import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return null

  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
    include: { client: true },
  })

  if (!proposal || proposal.userId !== session.user.id) notFound()

  const fields = [
    { label: 'Cliente', value: proposal.client.name },
    { label: 'Modalidade', value: proposal.modality },
    { label: 'Valor', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(proposal.value)) },
    { label: 'Finalidade', value: proposal.purpose },
    { label: 'Prazo', value: `${proposal.termMonths} meses` },
    { label: 'Forma de Pagamento', value: proposal.paymentMethod },
    { label: 'Encargos Financeiros', value: `${proposal.financialCharges}% a.m.` },
    { label: 'IOF', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(proposal.iof)) },
    { label: 'Garantias', value: proposal.guarantees },
    { label: 'Fee de Sucesso LFS', value: `${proposal.successFee}%` },
    { label: 'Data da Proposta', value: new Date(proposal.proposalDate).toLocaleDateString('pt-BR') },
  ]

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/proposals" className="text-sm text-gray-500 hover:text-gray-700">← Propostas</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">{proposal.client.name}</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Detalhes da Proposta</h2>
          {proposal.pdfFileName && (
            <a
              href={`/api/proposals/${proposal.id}/pdf`}
              download={proposal.pdfFileName}
              className="bg-[#C9A84C] hover:bg-[#E8C97A] text-[#0A1628] font-medium text-sm px-4 py-2 rounded transition-colors"
            >
              Baixar PDF
            </a>
          )}
        </div>

        <div className="divide-y divide-gray-50">
          {fields.map(f => (
            <div key={f.label} className="flex px-6 py-3">
              <div className="w-48 text-sm font-medium text-gray-700 flex-shrink-0">{f.label}</div>
              <div className="text-sm text-gray-600">{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
