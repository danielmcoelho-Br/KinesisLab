const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Trying to create patient with null birth_date...");
  try {
    const patient = await prisma.patient.create({
      data: {
        name: "Teste Null Date " + new Date().toISOString(),
        birth_date: null,
        age: 0,
        gender: "Masculino",
        created_by_id: null
      }
    });
    console.log("Success! Created patient:", patient);
  } catch (error) {
    console.error("FAILED to create patient:", error);
  }
}

main().finally(() => {
    prisma.$disconnect();
    pool.end();
});
