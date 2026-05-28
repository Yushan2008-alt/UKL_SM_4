import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

async function getPrisma() {
  const mod = await import('./../src/@generated/prisma/client.js')
  const Client = mod.PrismaClient
  return new Client({ adapter })
}

async function main() {
  const prisma = await getPrisma()
  const hashedPassword = await bcrypt.hash('password123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@studentcommerce.id' },
    update: {},
    create: { name: 'Admin', email: 'admin@studentcommerce.id', password: hashedPassword, role: 'ADMIN', isVerified: true },
  })

  const seller = await prisma.user.upsert({
    where: { email: 'toko@studentcommerce.id' },
    update: {},
    create: { name: 'Toko Demo', email: 'toko@studentcommerce.id', password: hashedPassword, role: 'SELLER', isVerified: true },
  })

  await prisma.user.upsert({
    where: { email: 'buyer@studentcommerce.id' },
    update: {},
    create: { name: 'Buyer Demo', email: 'buyer@studentcommerce.id', password: hashedPassword, role: 'BUYER' },
  })

  const categories = [
    { name: 'Tugas & ATK', slug: 'tugas-atk' },
    { name: 'Kebutuhan Kos', slug: 'kebutuhan-kos' },
    { name: 'Praktikum', slug: 'praktikum' },
    { name: 'Event Kampus', slug: 'event-kampus' },
    { name: 'Daily Essentials', slug: 'daily-essentials' },
  ]
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  console.log('Seed completed successfully!')
  await prisma.$disconnect()
}

main().catch(console.error)
