const pg = require('pg');
//const dotenv = require('dotenv');
//dotenv.config()

const { Pool } = pg;

const user = 'postgres';
const password = 'gjwn';
const host = 'localhost';
const port = 5432;
const database = 'crm';

const db = new Pool({
  user,
  password,
  host,
  port,
  database
});

/* const query = db.query('SELECT * FROM crmuser;');

query.then(result => {
    console.log(result.rows);
}); */

module.exports = db;