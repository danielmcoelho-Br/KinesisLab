import "dotenv/config"
import { PrismaClient } from '@prisma/client'

import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { questionnairesData } from '../src/data/questionnaires'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })


async function main() {
  console.log('Migrating questionnaires to database...')

  for (const [key, q] of Object.entries(questionnairesData)) {
    const existing = await prisma.assessmentTemplate.findFirst({
        where: { title: q.title }
    });

    if (!existing) {
        await prisma.assessmentTemplate.create({
            data: {
                title: q.title,
                description: q.description,
                segment: q.segment,
                icon_url: q.icon || '',
                structure: JSON.parse(JSON.stringify(q)), // Capture everything
                is_active: true
            }
        });
        console.log(`Migrated: ${q.title}`)
    }
  }

  // Create an admin user if not exists
  const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@kinesislab.com.br' }
  });

  if (!adminExists) {
      await prisma.user.create({
          data: {
              email: 'admin@kinesislab.com.br',
              password: 'admin', // In real life, use hash
              name: 'Administrador Principal',
              role: 'ADMINISTRADOR',
              is_active: true
          }
      });
      console.log('Admin user created: admin@kinesislab.com.br / admin')
  }

  console.log('Migration complete.')
}

main()
  .catch((e) => {
    console.error('Migration failed:');
    console.error(JSON.stringify(e, null, 2));
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
