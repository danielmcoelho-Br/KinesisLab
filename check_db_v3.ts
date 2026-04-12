import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const patientCount = await prisma.patient.count();
  const assessmentCount = await prisma.assessment.count();
  console.log(`Patients: ${patientCount}`);
  console.log(`Assessments: ${assessmentCount}`);
  
  if (assessmentCount > 0) {
    const lastAssessment = await prisma.assessment.findFirst({
      orderBy: { created_at: 'desc' },
      include: { patient: true }
    });
    console.log('Last Assessment:', {
      id: lastAssessment?.id,
      patient: lastAssessment?.patient.name,
      type: lastAssessment?.assessment_type,
      date: lastAssessment?.created_at
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
