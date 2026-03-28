import Anthropic from '@anthropic-ai/sdk'
import { ProposalFields, emptyProposalFields } from '@/types/proposal'

const EXTRACTION_PROMPT = `Você é um assistente especializado em extração de dados de e-mails e documentos financeiros em português brasileiro.

Analise a imagem fornecida e extraia os seguintes campos de uma proposta de crédito.
Retorne APENAS um JSON válido, sem texto adicional, markdown ou explicações:

{
  "clientName": "nome da empresa cliente (string ou null)",
  "modality": "modalidade do crédito (string ou null)",
  "value": valor em reais como número sem formatação (number ou null),
  "purpose": "finalidade do crédito (string ou null)",
  "termMonths": prazo em meses como inteiro (number ou null),
  "paymentMethod": "forma de pagamento (string ou null)",
  "financialCharges": encargos financeiros em percentual ao mês como decimal, ex: 1.5 para 1,5% (number ou null),
  "iof": IOF em reais como número sem formatação (number ou null),
  "guarantees": "garantias oferecidas (string ou null)",
  "successFee": fee de sucesso em percentual como decimal, ex: 2.0 para 2% (number ou null),
  "proposalDate": "data da proposta no formato YYYY-MM-DD (string ou null)",
  "extractionScore": sua confiança geral na extração de 0.0 a 1.0 (number)
}

Regras obrigatórias:
- Use null para campos não encontrados na imagem
- NUNCA invente valores — prefira null a uma suposição
- Valores monetários como números puros (ex: 150000.00, não "R$ 150.000,00")
- Percentuais como decimais (ex: 1.5 para 1,5% ao mês)
- Retorne SOMENTE o JSON, nenhum texto antes ou depois`

export async function extractProposalFromImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<{ fields: ProposalFields; extractionScore: number }> {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const parsed = JSON.parse(text)
    const score = parsed.extractionScore ?? 0.5

    const fields: ProposalFields = {
      clientName: parsed.clientName || '',
      modality: parsed.modality || '',
      value: parsed.value ?? null,
      purpose: parsed.purpose || '',
      termMonths: parsed.termMonths ?? null,
      paymentMethod: parsed.paymentMethod || '',
      financialCharges: parsed.financialCharges ?? null,
      iof: parsed.iof ?? null,
      guarantees: parsed.guarantees || '',
      successFee: parsed.successFee ?? null,
      proposalDate: parsed.proposalDate || new Date().toISOString().split('T')[0],
    }

    return { fields, extractionScore: score }
  } catch (error) {
    console.error('Claude extraction error:', error)
    return { fields: emptyProposalFields(), extractionScore: 0 }
  }
}
