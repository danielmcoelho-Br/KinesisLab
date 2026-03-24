
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')

async function main() {
  const connectionString = process.env.DATABASE_URL
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const patient = await prisma.patient.findFirst({
      select: { id: true, name: true }
    })
    console.log(JSON.stringify(patient))
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
