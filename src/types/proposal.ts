export interface ProposalFields {
  clientName: string
  modality: string
  value: number | null
  purpose: string
  termMonths: number | null
  paymentMethod: string
  financialCharges: number | null
  iof: number | null
  guarantees: string
  successFee: number | null
  proposalDate: string
}

export function emptyProposalFields(): ProposalFields {
  return {
    clientName: '',
    modality: '',
    value: null,
    purpose: '',
    termMonths: null,
    paymentMethod: '',
    financialCharges: null,
    iof: null,
    guarantees: '',
    successFee: null,
    proposalDate: new Date().toISOString().split('T')[0],
  }
}
