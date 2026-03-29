const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '250730',
  database: 'cruise_booking',
});

async function test() {
  try {
    await client.connect();
    const res = await client.query('SELECT password_hash FROM users WHERE email = $1', ['admin@cruiseline.com']);
    if (res.rows.length > 0) {
      const hash = res.rows[0].password_hash;
      console.log('Hash found:', hash);
      const isMatch = await bcrypt.compare('Admin1234!', hash);
      console.log('Password Admin1234! matches:', isMatch);
    } else {
      console.log('Admin not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

test();
