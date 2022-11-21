const db = require('../database/db.js')

async function CreateUser({newUser, newPassword}){
    return db.query('INSERT INTO crmuser (name, email, password, plan) VALUES ($1, $2, $3, $4)',
    [newUser.name, newUser.email, newPassword, newUser.plan])
}

async function FindUserById(id){
    return db.query('SELECT * FROM crmuser WHERE id = $1', [id])
}

async function Update({id, newName}){
    return db.query('UPDATE crmuser SET name = $1 WHERE id = $2',
    [newName, id])
}

async function SearchEmail(email){
    return db.query('SELECT * FROM crmuser WHERE email = $1', [email])
}

async function Login(user){
    return db.query('SELECT * FROM crmuser WHERE email = $1',[user.email])
}

async function UserList(){
    return db.query('SELECT * FROM crmuser')
}

async function InsertToken({id, token}){
    return db.query('INSERT INTO session (id, token) VALUES ($1, $2)', [id, token])
}

async function FindToken(token){
    return db.query('SELECT * FROM session WHERE token = $1',[token]);
}

async function DeleteUser(id){
    return db.query('DELETE FROM crmuser WHERE id = $1', [id])
}

async function LogOut(id){
    return db.query('DELETE FROM session WHERE id = $1', [id])
}

async function ChangePassword({id, newPassword}){
    return db.query('UPDATE crmuser SET password = $1 WHERE id = $2',
    [newPassword, id])
}

module.exports = {ChangePassword, LogOut, CreateUser, FindUserById, SearchEmail, Update, Login, UserList, InsertToken, FindToken, DeleteUser}