import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
async function main() {
  const { PrismaClient } = await import('./../src/@generated/prisma/client.js')
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })
  const newPassword = 'minuklcommerce' // ganti sesuai keinginan
  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { email: 'admin@studentcommerce.id' },
    data: { password: hashed },
  })
  console.log('Password admin berhasil diubah!')
  await prisma.$disconnect()
}
main().catch(console.error)