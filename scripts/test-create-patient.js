const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Trying to create test patient...");
  try {
    const patient = await prisma.patient.create({
      data: {
        name: "Teste de Criação " + new Date().toISOString(),
        birth_date: new Date("1990-01-01"),
        age: 34,
        gender: "Masculino",
        created_by_id: "daniel-m-coelho-id",
        change_logs: [
          {
            timestamp: new Date().toISOString(),
            entry: `Paciente cadastrado via script`
          }
        ]
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
