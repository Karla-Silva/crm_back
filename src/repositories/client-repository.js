const db = require('../database/db.js')

async function CreateClient({clientName, clientEmail, id}){
    return db.query('INSERT INTO client ("clientName", "clientEmail", "userid") VALUES ($1, $2, $3)',[clientName, clientEmail, id])
}

async function GetClients({id}){
    return db.query('SELECT * FROM client WHERE userid = $1', [id])
}

module.exports = { CreateClient, GetClients }
