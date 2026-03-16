const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Checking database connection and schema...");
  try {
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in public schema:");
    console.log(tables.rows.map(r => r.table_name).join(', '));

    const patientsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'patients'
    `);
    console.log("\nColumns in 'patients':");
    console.table(patientsColumns.rows);

    const assessmentsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'assessments'
    `);
    console.log("\nColumns in 'assessments':");
    console.table(assessmentsColumns.rows);

    // Check for standard users
    const users = await pool.query(`SELECT id, email FROM users LIMIT 5`);
    console.log("\nExisting users (first 5):");
    console.table(users.rows);

  } catch (error) {
    console.error("Database diagnostic FAILED:", error);
  } finally {
    await pool.end();
  }
}

main();
