import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'
import { ProposalFields } from '@/types/proposal'

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value))
}

function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}% a.m.`
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export async function generateProposalPdf(
  fields: ProposalFields
): Promise<Buffer> {
  const templatePath = path.join(process.cwd(), 'templates', 'proposal-template.html')
  let html = await fs.readFile(templatePath, 'utf-8')

  html = html
    .replace('{{DATA}}', formatDate(fields.proposalDate))
    .replace('{{NOME_CLIENTE}}', fields.clientName || '—')
    .replace('{{MODALIDADE}}', fields.modality || '—')
    .replace('{{VALOR}}', formatCurrency(fields.value))
    .replace('{{FINALIDADE}}', fields.purpose || '—')
    .replace('{{PRAZO}}', fields.termMonths ? `${fields.termMonths} meses` : '—')
    .replace('{{FORMA_PAGAMENTO}}', fields.paymentMethod || '—')
    .replace('{{ENCARGOS}}', formatPercent(fields.financialCharges))
    .replace('{{IOF}}', formatCurrency(fields.iof))
    .replace('{{GARANTIAS}}', fields.guarantees || '—')
    .replace('{{FEE_SUCESSO}}', fields.successFee ? `${fields.successFee}% sobre o valor captado` : '—')

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: true,
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

export function generatePdfFileName(clientName: string, date: string): string {
  const slug = clientName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
  const dateSlug = date.replace(/-/g, '')
  return `proposta-${slug}-${dateSlug}.pdf`
}
