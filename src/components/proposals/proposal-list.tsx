'use client'

import Link from 'next/link'

interface ProposalItem {
  id: string
  clientName: string
  modality: string
  value: number
  proposalDate: string
  status: string
  pdfFileName: string | null
  createdAt: string
}

const statusLabel: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-100 text-gray-600' },
  GENERATED: { label: 'PDF Gerado', color: 'bg-green-100 text-green-700' },
  SUBMITTED: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
}

export default function ProposalList({ proposals }: { proposals: ProposalItem[] }) {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
        <div className="text-4xl mb-3">📄</div>
        <h3 className="text-gray-700 font-medium mb-1">Nenhuma proposta ainda</h3>
        <p className="text-gray-400 text-sm mb-4">Crie sua primeira proposta de crédito</p>
        <Link
          href="/proposals/new"
          className="inline-block bg-[#0A1628] text-white px-4 py-2 rounded text-sm"
        >
          Criar primeira proposta
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Cliente</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Modalidade</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Valor</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Data</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {proposals.map(p => {
            const st = statusLabel[p.status] || statusLabel.DRAFT
            return (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.clientName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.modality}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(p.proposalDate).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${st.color}`}>
                    {st.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link href={`/proposals/${p.id}`} className="text-xs text-[#0A1628] hover:underline">
                    Ver
                  </Link>
                  {p.pdfFileName && (
                    <a
                      href={`/api/proposals/${p.id}/pdf`}
                      download={p.pdfFileName}
                      className="text-xs text-[#C9A84C] hover:underline"
                    >
                      PDF
                    </a>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
