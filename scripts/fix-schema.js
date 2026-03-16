const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  console.log('Applying database alterations...');

  const sql = `
    -- Alter patients table
    ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS birth_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_by_id TEXT,
ADD COLUMN IF NOT EXISTS change_logs JSONB;

    -- Alter assessments table
    ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS created_by_id TEXT,
ADD COLUMN IF NOT EXISTS change_logs JSONB;
  `;

  try {
    await pool.query(sql);
    console.log('Database alterations applied successfully.');
  } catch (error) {
    console.error('Error applying alterations:', error.message);
  } finally {
    await pool.end();
  }
}

main();
