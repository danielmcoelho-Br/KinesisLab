const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  const tables = ['patients', 'assessments', 'users', 'assessment_templates', 'profiles'];

  for (const table of tables) {
    console.log(`--- Table: ${table} ---`);
    try {
      const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${table}'
      `);
      console.log(res.rows);
    } catch (error) {
      console.error(`Error checking ${table}:`, error.message);
    }
  }

  await pool.end();
}

main();
