const { Client } = require("pg");
require("dotenv").config({ path: "./.env" });

async function testPostgres() {
  const connectionString = process.env.neon_db;
  console.log("Testing Neon DB Connection...");
  console.log("Connection string exists:", !!connectionString);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to Neon!");
    const res = await client.query("SELECT NOW()");
    console.log("Result:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("❌ Connection failed!");
    console.error(err);
  }
}

testPostgres();
