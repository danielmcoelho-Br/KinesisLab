import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

async function main() {
  const connectionString = `${process.env.DATABASE_URL}`
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool as any)
  const prisma = new PrismaClient({ adapter })

  const adminEmail = 'admin@admin.com'
  const adminPassword = 'admin' 

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      role: 'administrator',
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      role: 'administrator',
      name: 'Administrador Kinesis'
    },
  })

  console.log({ user })

  const assessmentTemplates = [
    {
        title: "Avaliação Funcional Cervical",
        segment: "Cervical",
        description: "Avaliação da coluna cervical incluindo movimento, palpação e testes neurológicos.",
        icon_url: "/img/icon_cervical.png",
        structure: {
            sections: [
                { id: 'anamnese', title: 'Características da Disfunção', fields: [{ id: 'queixa', label: 'Queixa Principal', type: 'textarea' }, { id: 'intensidade_dor', label: 'Intensidade da Dor', type: 'range', min: 0, max: 10, step: 1 }, { id: 'area_dor', label: 'Área da Dor', type: 'bodyschema', image: '/img/esquema_corpo_inteiro.png' }] },
                { id: 'neuro_forca', title: 'Avaliação Neurológica (Força Muscular)', type: 'table', columns: ['Miótono', 'Esquerdo', 'Direito'], rows: [{ id: 'c5', label: 'C5', fields: ['esquerdo', 'direito'] }, { id: 'c6', label: 'C6', fields: ['esquerdo', 'direito'] }] }
            ]
        }
    },
    {
        title: "Avaliação Funcional Lombar",
        segment: "Lombar",
        description: "Avaliação da coluna lombar incluindo movimento.",
        icon_url: "/img/icon_lombar.png",
        structure: {
            sections: [
                { id: 'anamnese', title: 'Anamnese', fields: [{ id: 'queixa', label: 'Queixa Principal', type: 'textarea' }] }
            ]
        }
    }
  ];

  for (const t of assessmentTemplates) {
    const id = t.title.toLowerCase().replace(/ /g, '_');
    await prisma.assessmentTemplate.upsert({
      where: { id },
      update: t,
      create: { id, ...t }
    });
  }

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
