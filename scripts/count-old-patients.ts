import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const cutoffDate = new Date('2026-03-15T00:00:00Z')
  
  const patientsToCount = await prisma.patient.count({
    where: {
      created_at: {
        lt: cutoffDate,
      },
    },
  })

  console.log(`Number of patients added before ${cutoffDate.toISOString()}: ${patientsToCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
