const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const res = await pool.query(`
    SELECT column_name, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'patients'
  `);
  console.log(JSON.stringify(res.rows, null, 2));
}

main().finally(() => pool.end());
