const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_ZIp8aCD5sPdk@ep-quiet-scene-aitufoy0.c-4.us-east-1.aws.neon.tech:443/neondb',
  ssl: {
    rejectUnauthorized: false,
    servername: 'ep-quiet-scene-aitufoy0.c-4.us-east-1.aws.neon.tech'
  },
  connectionTimeoutMillis: 5000,
});

async function test() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT 1 as result');
    console.log(res.rows);
  } catch (err) {
    console.error("Connection error:", err.message);
  } finally {
    await client.end();
  }
}

test();
