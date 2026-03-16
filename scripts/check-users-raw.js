const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const res = await pool.query("SELECT id, email, name FROM users");
  console.log(JSON.stringify(res.rows, null, 2));
}

main().finally(() => pool.end());
