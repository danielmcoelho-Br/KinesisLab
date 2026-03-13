import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

async function main() {
  const connectionString = `${process.env.DATABASE_URL}`
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const adminEmail = 'admin@admin.com'
  const adminPassword = 'admin' 

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      role: 'administrator',
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      role: 'administrator',
      name: 'Administrador Kinesis'
    },
  })

  console.log({ user })
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
