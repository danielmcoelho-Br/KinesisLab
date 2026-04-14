const { Pool } = require('pg');

async function checkColumns() {
    const connectionString = "postgresql://postgres.vreyoklzzrpfjaywmaeh:Verd12!@Leinad127@aws-1-sa-east-1.pooler.supabase.com:5432/postgres";
    const pool = new Pool({ connectionString });
    
    try {
        console.log("Connecting to DB...");
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND table_schema = 'public'
            ORDER BY column_name;
        `);
        console.log("Columns in 'public.users' table:");
        if (res.rows.length === 0) {
            console.log("Table 'public.users' NOT FOUND!");
        } else {
            res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
        }
    } catch (error) {
        console.error("DB CHECK ERROR:", error.message);
    } finally {
        await pool.end();
    }
}

checkColumns();
