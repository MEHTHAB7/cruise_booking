import * as dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cruise_booking',
});

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "user_sessions" (
              "sid" varchar NOT NULL COLLATE "default",
              "sess" json NOT NULL,
              "expire" timestamp(6) NOT NULL,
              CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
            ) WITH (OIDS=FALSE);
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");
        `);
        console.log("✅ Table user_sessions created.");
    } catch (e) {
        console.error("❌ Error creating table:", e.message);
    } finally {
        await pool.end();
    }
}

createTable();
