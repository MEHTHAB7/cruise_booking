import pkg from 'pg';
const { Client } = pkg;

async function test() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '350730',
        database: 'postgres', // default db
    });
    try {
        await client.connect();
        console.log("✅ Successfully connected to postgres database");
        await client.end();
    } catch (e) {
        console.error("❌ Connection failed:", e.message);
    }
}
test();
