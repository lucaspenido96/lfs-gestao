import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateProposalPdf, generatePdfFileName } from '@/lib/pdf'
import { NextRequest } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const proposals = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(proposals.map(p => ({
    ...p,
    value: Number(p.value),
    financialCharges: Number(p.financialCharges),
    iof: Number(p.iof),
    successFee: Number(p.successFee),
    pdfData: undefined,
  })))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const {
      clientName, modality, value, purpose, termMonths,
      paymentMethod, financialCharges, iof, guarantees,
      successFee, proposalDate, sourceType, extractionScore,
    } = body

    // Upsert client
    const existingClient = await prisma.client.findFirst({ where: { name: clientName } })
    const client = existingClient
      ? existingClient
      : await prisma.client.create({ data: { name: clientName } })

    // Create proposal as DRAFT first
    const proposal = await prisma.proposal.create({
      data: {
        userId: session.user.id,
        clientId: client.id,
        modality,
        value,
        purpose,
        termMonths: parseInt(termMonths),
        paymentMethod,
        financialCharges,
        iof,
        guarantees,
        successFee,
        proposalDate: new Date(proposalDate + 'T12:00:00'),
        sourceType: sourceType || 'MANUAL',
        extractionScore: extractionScore || null,
        status: 'DRAFT',
      },
    })

    // Generate PDF
    const pdfBuffer = await generateProposalPdf({
      clientName, modality, value, purpose, termMonths,
      paymentMethod, financialCharges, iof, guarantees,
      successFee, proposalDate,
    })

    const pdfFileName = generatePdfFileName(clientName, proposalDate)

    // Update with PDF
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        pdfData: pdfBuffer,
        pdfFileName,
        status: 'GENERATED',
      },
    })

    return Response.json({ id: proposal.id, pdfFileName })
  } catch (error) {
    console.error('Create proposal error:', error)
    return Response.json({ error: 'Failed to create proposal' }, { status: 500 })
  }
}
