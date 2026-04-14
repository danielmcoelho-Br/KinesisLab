const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.patient.findFirst({ select: { id: true } })
  .then(p => {
    console.log('ID:' + p.id);
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
