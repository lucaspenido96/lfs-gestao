import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Elevador66', 12)

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'lucas@lfsfinancial.com.br' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'lucas@lfsfinancial.com.br',
      password,
      name: 'Lucas',
    },
  })

  const banks = ['Bradesco', 'Itaú', 'Santander', 'BTG Pactual', 'Caixa Econômica', 'BNDES', 'Banco do Brasil', 'ABC Brasil']
  for (const name of banks) {
    await prisma.bank.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('Seed concluido: usuario lucas + 8 bancos criados')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
