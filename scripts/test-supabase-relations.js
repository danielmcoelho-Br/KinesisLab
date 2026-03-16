const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking patients with creators...");
  try {
    const patients = await prisma.patient.findMany({
      include: { 
        created_by: true,
        assessments: true
      },
      take: 2
    });
    console.log("Found patients:", patients.length);
    if (patients.length > 0) {
        console.log("Sample patient with creator:", {
            name: patients[0].name,
            creator_name: patients[0].created_by?.name || 'Vazio'
        });
    }
  } catch (error) {
    console.error("Test FAILED:", error);
  }
}

main().finally(() => {
    prisma.$disconnect();
    pool.end();
});
