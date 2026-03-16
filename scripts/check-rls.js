const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const res = await pool.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename IN ('patients', 'assessments', 'users')
  `);
  console.log("RLS Status:");
  console.log(JSON.stringify(res.rows, null, 2));

  const triggers = await pool.query(`
    SELECT tgname, relname as tablename
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname IN ('patients', 'assessments')
  `);
  console.log("Triggers:");
  console.log(JSON.stringify(triggers.rows, null, 2));
}

main().finally(() => pool.end());
