const db = require('../database/db.js')

async function CreateUser({newUser, newPassword}){
    console.log(db);
    return db.query('INSERT INTO crmuser (name, email, password, plan) VALUES ($1, $2, $3, $4)',
    [newUser.name, newUser.email, newPassword, newUser.plan])
}

async function Login(user){
    return db.query('SELECT * FROM crmuser WHERE email = $1',[user.email])
}

async function InsertToken({id, token}){
    return db.query('INSERT INTO session (id, token) VALUES ($1, $2)', [id, token])
}

async function FindToken(){
    return db.query('',[])
}

module.exports = { CreateUser , Login, InsertToken, FindToken}