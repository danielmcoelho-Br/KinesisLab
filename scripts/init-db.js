const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  console.log('Initializing database tables via SQL...');

  const createTablesSql = `
    -- Enable UUID extension if not enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create public.users table if not exists
    CREATE TABLE IF NOT EXISTS public.users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'ASSISTENTE',
      crefito TEXT,
      avatar_url TEXT,
      birth_date TIMESTAMPTZ,
      is_active BOOLEAN DEFAULT true,
      force_password_change BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      change_logs JSONB
    );

    -- Create public.patients table if not exists
    CREATE TABLE IF NOT EXISTS public.patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      birth_date TIMESTAMPTZ,
      age INTEGER,
      gender TEXT,
      dominance TEXT,
      activity_level TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      created_by_id TEXT REFERENCES public.users(id),
      change_logs JSONB
    );

    -- Create public.assessments table if not exists
    CREATE TABLE IF NOT EXISTS public.assessments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
      assessment_type TEXT NOT NULL,
      segment TEXT NOT NULL,
      clinical_data JSONB,
      questionnaire_answers JSONB,
      created_at TIMESTAMPTZ DEFAULT now(),
      created_by_id TEXT REFERENCES public.users(id),
      change_logs JSONB
    );

    -- Create public.assessment_templates table if not exists
    CREATE TABLE IF NOT EXISTS public.assessment_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      segment TEXT NOT NULL,
      icon_url TEXT,
      structure JSONB NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      created_by_id TEXT REFERENCES public.users(id),
      change_logs JSONB
    );
  `;

  try {
    await pool.query(createTablesSql);
    console.log('Tables created successfully.');

    const adminEmail = 'admin@admin.com';
    const adminPassword = 'admin';
    const adminId = 'admin-user-id'; // Use a fixed ID for simplicity in seeding

    const seedSql = `
      INSERT INTO public.users (id, email, password, name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE 
      SET password = EXCLUDED.password, role = EXCLUDED.role, name = EXCLUDED.name;
    `;

    await pool.query(seedSql, [adminId, adminEmail, adminPassword, 'Administrador Kinesis', 'administrator']);
    console.log('Admin user seeded.');

    console.log('Initialization completed.');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

main();
