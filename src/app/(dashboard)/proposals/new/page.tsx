'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ProposalFields, emptyProposalFields } from '@/types/proposal'

type Step = 'upload' | 'review' | 'done'

const FIELD_LABELS: Record<keyof ProposalFields, string> = {
  clientName: 'Nome do Cliente (Empresa)',
  modality: 'Modalidade',
  value: 'Valor (R$)',
  purpose: 'Finalidade',
  termMonths: 'Prazo (meses)',
  paymentMethod: 'Forma de Pagamento',
  financialCharges: 'Encargos Financeiros (% a.m.)',
  iof: 'IOF (R$)',
  guarantees: 'Garantias',
  successFee: 'Fee de Sucesso LFS (%)',
  proposalDate: 'Data da Proposta',
}

export default function NewProposalPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('upload')
  const [fields, setFields] = useState<ProposalFields>(emptyProposalFields())
  const [extracting, setExtracting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ProposalFields, string>>>({})
  const [proposalId, setProposalId] = useState<string | null>(null)
  const [pdfFileName, setPdfFileName] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Máximo: 10MB')
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      alert('Formato não suportado. Use JPG, PNG, WEBP ou PDF')
      return
    }

    setExtracting(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1]
      try {
        const res = await fetch('/api/proposals/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        })
        const data = await res.json()
        if (data.fields) {
          setFields(prev => ({ ...prev, ...data.fields }))
        }
      } catch {
        // silent fail — usuário preenche manualmente
      } finally {
        setExtracting(false)
        setStep('review')
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }, [])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProposalFields, string>> = {}
    const required: (keyof ProposalFields)[] = [
      'clientName', 'modality', 'value', 'purpose', 'termMonths',
      'paymentMethod', 'financialCharges', 'iof', 'guarantees', 'successFee', 'proposalDate',
    ]
    for (const key of required) {
      const val = fields[key]
      if (val === null || val === undefined || val === '') {
        newErrors[key] = 'Campo obrigatório'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGenerate = async () => {
    if (!validate()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, sourceType: 'UPLOAD' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setProposalId(data.id)
      setPdfFileName(data.pdfFileName)
      setStep('done')

      // Auto download
      const pdfRes = await fetch(`/api/proposals/${data.id}/pdf`)
      const blob = await pdfRes.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.pdfFileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Erro ao gerar PDF. Tente novamente.')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">PDF gerado com sucesso!</h2>
        <p className="text-gray-500 text-sm mb-8">O download foi iniciado automaticamente.</p>
        <div className="flex gap-3 justify-center">
          {proposalId && (
            <a
              href={`/api/proposals/${proposalId}/pdf`}
              download={pdfFileName || 'proposta.pdf'}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded text-sm transition-colors"
            >
              Baixar novamente
            </a>
          )}
          <button
            onClick={() => { setStep('upload'); setFields(emptyProposalFields()); setProposalId(null) }}
            className="bg-[#0A1628] text-white px-4 py-2 rounded text-sm"
          >
            Nova Proposta
          </button>
          <button onClick={() => router.push('/proposals')} className="text-[#C9A84C] hover:underline text-sm px-4 py-2">
            Ver Histórico
          </button>
        </div>
      </div>
    )
  }

  if (step === 'review') {
    const numberFields: (keyof ProposalFields)[] = ['value', 'termMonths', 'financialCharges', 'iof', 'successFee']

    return (
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep('upload')} className="text-sm text-gray-500 hover:text-gray-700">← Voltar</button>
          <h1 className="text-xl font-semibold text-gray-900">Revisar Dados</h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {(Object.keys(FIELD_LABELS) as (keyof ProposalFields)[]).map(key => {
            const label = FIELD_LABELS[key]
            const error = errors[key]
            const isTextarea = key === 'guarantees'
            const isDate = key === 'proposalDate'
            const isNumber = numberFields.includes(key)

            return (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                  {label}
                </label>
                {isTextarea ? (
                  <textarea
                    name={key}
                    value={String(fields[key] || '')}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C] ${error ? 'border-red-400' : 'border-gray-300'}`}
                  />
                ) : (
                  <input
                    type={isDate ? 'date' : isNumber ? 'number' : 'text'}
                    name={key}
                    value={fields[key] === null ? '' : String(fields[key])}
                    onChange={handleInputChange}
                    step={isNumber ? 'any' : undefined}
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C] ${error ? 'border-red-400' : 'border-gray-300'}`}
                  />
                )}
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
            )
          })}

          <div className="pt-4">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-[#0A1628] hover:bg-[#112040] disabled:opacity-50 text-white font-semibold py-3 rounded transition-colors"
            >
              {generating ? 'Gerando PDF...' : 'Gerar PDF'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step: upload
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Nova Proposta</h1>

      {extracting ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-3xl mb-3 animate-pulse">🔍</div>
          <p className="text-gray-700 font-medium">Analisando imagem...</p>
          <p className="text-gray-400 text-sm mt-1">Claude está extraindo os dados da proposta</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById('file-input')?.click()}
            className={`bg-white rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-gray-300 hover:border-[#C9A84C]'
            }`}
          >
            <input
              id="file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            <div className="text-4xl mb-3">📎</div>
            <p className="font-medium text-gray-700">Arraste a foto do e-mail aqui</p>
            <p className="text-gray-400 text-sm mt-1">ou clique para selecionar</p>
            <p className="text-gray-300 text-xs mt-3">JPG, PNG, WEBP ou PDF · máx. 10MB</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="flex-1 h-px bg-gray-200" />
            <span>ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Manual */}
          <button
            onClick={() => setStep('review')}
            className="w-full border border-gray-300 hover:border-[#0A1628] text-gray-700 hover:text-[#0A1628] py-3 rounded text-sm font-medium transition-colors"
          >
            Digitar Manualmente
          </button>
        </div>
      )}
    </div>
  )
}
