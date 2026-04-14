import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const patient = await prisma.patient.findFirst({
    select: { id: true }
  })
  console.log('PATIENT_ID:', patient?.id)
}
main()
