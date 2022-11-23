const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const { Pool } = pg;

const user = process.env.POSTGRES_USERNAME;
const password = process.env.POSTGRES_PASSWORD;
const host = process.env.POSTGRES_HOST;
const port = process.env.POSTGRES_PORT;
const database = process.env.POSTGRES_DATABASE;

const db = new Pool({
  user,
  password,
  host,
  port,
  database
  /* connectionString:process.env.DATABASE_URL */
});

const query = db.query('SELECT * FROM crmuser;');

query.then(result => {
    console.log(result.rows);
});

module.exports = db;