const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '250730',
  database: 'cruise_booking',
});

async function reset() {
  try {
    await client.connect();
    const hash = await bcrypt.hash('Admin1234!', 12);
    const res = await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'admin@cruiseline.com']);
    console.log('Update result:', res.rowCount);
    if (res.rowCount === 0) {
      console.log('Admin user not found. Creating it.');
      // Need UUID for ID
      const { v4: uuidv4 } = require('uuid');
      const id = uuidv4();
      await client.query(
        'INSERT INTO users (id, email, password_hash, role, first_name, last_name, privacy_accepted) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, 'admin@cruiseline.com', hash, 'admin', 'Admin', 'User', true]
      );
      console.log('Admin user created');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

reset();
