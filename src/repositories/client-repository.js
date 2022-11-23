const db = require('../database/db.js')

async function FindClient(){
    return db.query('',[])
}

export {FindClient}
