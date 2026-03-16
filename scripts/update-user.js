const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  console.log('Configuring user: danielmcoelho@gmail.com...');

  try {
    const userEmail = 'danielmcoelho@gmail.com';
    const userPassword = '123456';
    const userId = 'daniel-m-coelho-id';

    const seedSql = `
      INSERT INTO public.users (id, email, password, name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE 
      SET password = EXCLUDED.password, role = 'administrator', name = EXCLUDED.name;
    `;

    await pool.query(seedSql, [userId, userEmail, userPassword, 'Daniel Coelho', 'administrator']);
    console.log('User danielmcoelho@gmail.com configured as administrator.');

  } catch (error) {
    console.error('Error configuring user:', error);
  } finally {
    await pool.end();
  }
}

main();
