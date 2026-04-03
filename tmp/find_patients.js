import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const patients = await prisma.patient.findMany({
    select: { id: true, name: true }
  })
  console.log(JSON.stringify(patients, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
