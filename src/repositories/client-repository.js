const db = require('../database/db.js')

async function CreateClient({clientName, clientEmail, id}){
    return db.query('INSERT INTO client ("clientName", "clientEmail", "userid") VALUES ($1, $2, $3)',[clientName, clientEmail, id])
}

async function GetClients({id}){
    return db.query('SELECT * FROM client WHERE userid = $1 AND necessities IS null', [id])
}

async function AddNecessities({necessities, clientid}){
    return db.query('UPDATE client SET necessities = $1 WHERE clientid = $2',[necessities, clientid])
}

async function GetNecessities({id}){
    return db.query('SELECT * FROM client WHERE userid = $1 AND necessities IS NOT null AND proposal IS null', [id])
}

async function AddProposal({proposal, clientid}){
    return db.query('UPDATE client SET proposal = $1 WHERE clientid = $2', [proposal, clientid])
}

async function GetProposal({id}){
    return db.query('SELECT * FROM client WHERE userid = $1 AND necessities IS NOT null AND proposal IS NOT null AND result IS null', [id])
}

async function AddResult({result, clientid}){
    return db.query('UPDATE client SET result = $1 WHERE clientid = $2', [result, clientid])
}

async function GetResult({id}){
    return db.query('SELECT * FROM client WHERE userid = $1 AND result IS NOT null',[id])
}

async function DeleteClient({clientid}){
    return db.query('DELETE FROM client WHERE clientid = $1', [clientid])
}

module.exports = { 
    CreateClient, 
    GetClients, 
    AddNecessities, 
    GetNecessities, 
    AddProposal, 
    GetProposal, 
    AddResult,
    GetResult,
    DeleteClient
}
