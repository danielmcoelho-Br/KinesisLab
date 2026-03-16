const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const res = await pool.query(`
    SELECT * FROM pg_policies WHERE tablename = 'patients'
  `);
  console.log("RLS Policies for patients:");
  console.log(JSON.stringify(res.rows, null, 2));
}

main().finally(() => pool.end());
