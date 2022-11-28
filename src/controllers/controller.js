const User = require('../schema/schema.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../repositories/auth-repository.js')
const client = require('../repositories/client-repository.js')
const db = require('../database/db.js')
//const { v4: uuidv4 } = require('uuid')
require('dotenv').config()

//----------------------------Registro de usuário--------------------------
exports.register = async (req, res) => {
    const newUser = req.body;
    const isValid = User.userSchema.validate(newUser);

    if(isValid.error){
        return res.status(422).send(isValid.error.details)
    }  

    try {
        const newPassword = await bcrypt.hash(newUser.password, 10);
        await auth.CreateUser({newUser, newPassword})
        console.log('ETAPA 1')
        const user = {
            email: newUser.email,
            password: newUser.password
        }
        console.log(user)
        const token = jwt.sign(
            {
                name: newUser.name,
                email: newUser.email
            },
            process.env.JWT_SECRET
        )
        console.log('token')
        const searchUser = await auth.Login(user);
        console.log(searchUser)
        const id = searchUser.rows[0].id
        await auth.InsertToken({id, token})
        return res.status(201).send(token)
    } catch (err) {
        return res.status(500).send('erro no cadastro')
    }
}

//---------------------------------Login-----------------------------------
exports.login = async (req, res) => {
    const user = req.body;
    const isValid = User.loginSchema.validate(user);

    if(isValid.error){
        return res.status(422).send(isValid.error.details)
    }

    try{
        const searchUser = await auth.Login(user);
        if(searchUser && bcrypt.compareSync(user.password, searchUser.rows[0].password)){
            const token = jwt.sign(
                {
                    name: searchUser.rows[0].name,
                    email: searchUser.rows[0].email
                },
                process.env.JWT_SECRET
            )
            const {id} = searchUser.rows[0]
            await auth.InsertToken({id, token})
            res.send(token).status(200)
        }else{
            return res.status(401).send('Não encontrado. Usuário ou senha incorretos.')
        }
    }catch(error){
        return res.status(401).send('error')
    }
}

//------------------------------Logout-----------------------------------
exports.logout = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]

    if(!token) return res.status(401).send('Não autorizado');

    try{
        jwt.verify(token, process.env.JWT_SECRET)
    } catch (error){
        return res.status(400).send('Não autorizado')
    }
    
    try{
        await auth.LogOut(token);
        res.status(200).send('Logout concluido');
    }catch(err){
        console.log(err)
        res.status(500).send('erro no logout');
    }
}

//---------------------------Lista dos usuários----------------------
exports.userslist = async (req, res) => {
    const usersList = await auth.UserList(); 
    return res.json(usersList).status(200);
}

//---------------------------Atualizar Senha--------------------------
exports.changePassword = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
    
    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })

    const user = req.body;
    
    try{ 
        const searchUser = await auth.Login(user);
        const {id} = searchUser.rows[0]
        const newPassword = await bcrypt.hash(req.body.password, 10);
        await auth.ChangePassword({id, newPassword});
        res.status(200).send('Senha alterada') 
    }catch(err){
        res.status(500).send(err)
    } 
}

//---------------------------Deletar usuário---------------------------
exports.delete = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
    
    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })

    const user = req.body;
    
    try{
        const searchUser = await auth.Login(user);
        const {id} = searchUser.rows[0]
        auth.LogOut(token);
        auth.DeleteUser(id);
        res.status(200).send('Usuário deletado');
    }catch(err){
        console.log(err)
        res.status(500).send('Não deletado');
    }
}


//----------------------------Criar cliente----------------------
exports.createClient = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]

    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })

    const {email, clientName, clientEmail} = req.body;
    
    try{ 
        const user = await auth.SearchEmail(email);
        const {id} = user.rows[0];
        const promise = await client.CreateClient({clientName, clientEmail, id});
        res.sendStatus(201)
    }catch(err){
        res.status(500).send(err);
    } 

}

//-------------------------GET Clientes criados-------------------
exports.getclients = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
 
    if(!token) return res.sendStatus(401);
 
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })

    const email = req.params.email;
    
    try{ 
        const user = await auth.SearchEmail(email);
        const {id} = user.rows[0];
        const clientsList = await client.GetClients({id});
        res.json(clientsList.rows).status(200);
    }catch(err){
        res.status(500).send(err);
    } 
}

//----------------------------Add necessidades------------------
exports.addNecessities = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
 
    if(!token) return res.sendStatus(401);
 
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })

    const {necessities, clientid} = req.body;

    try{
        await client.AddNecessities({necessities, clientid})
        res.sendStatus(200)
    }catch(err){
        res.send(err).status(500)
    }
}

//---------------------------GET necessidades------------------
exports.getNecessities = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
 
    if(!token) return res.sendStatus(401);
 
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })

    const email = req.params.email;
    
    try{ 
        const user = await auth.SearchEmail(email);
        const {id} = user.rows[0];
        const clientsList = await client.GetNecessities({id});
        res.json(clientsList.rows).status(200);
    }catch(err){
        res.status(500).send(err);
    } 
}

//----------------------------Add Proposta----------------------
exports.addProposal = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
 
    if(!token) return res.sendStatus(401);
 
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })

    const {proposal, clientid} = req.body;

    try{
        await client.AddProposal({proposal, clientid})
        res.sendStatus(200)
    }catch(err){
        res.send(err).status(500)
    }
}

//----------------------------GET Proposta-----------------------
exports.getProposal = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
 
    if(!token) return res.sendStatus(401);
 
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })

    const email = req.params.email;
    
    try{ 
        const user = await auth.SearchEmail(email);
        const {id} = user.rows[0];
        const clientsList = await client.GetProposal({id});
        res.json(clientsList.rows).status(200);
    }catch(err){
        res.status(500).send(err);
    } 
}

//----------------------------Add Resultado----------------------
exports.addResult = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
 
    if(!token) return res.sendStatus(401);
 
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })

    const {result, clientid} = req.body;

    try{
        await client.AddResult({result, clientid})
        res.sendStatus(200)
    }catch(err){
        res.send(err).status(500)
    }
}

//----------------------------Get resultado---------------------
exports.getResult = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
 
    if(!token) return res.sendStatus(401);
 
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })

    const email = req.params.email;
    
    try{ 
        const user = await auth.SearchEmail(email);
        const {id} = user.rows[0];
        const clientsList = await client.GetResult({id});
        res.json(clientsList.rows).status(200);
    }catch(err){
        res.status(500).send(err);
    } 
}

//----------------------------Deletar cliente-------------------
exports.deleteClient = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
 
    if(!token) return res.sendStatus(401);
 
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })

    const clientid = req.params.clientid;

    try{
        await client.DeleteClient({clientid});
        res.sendStatus(200);
    }catch(err){
        res.status(500).send(err);
    }
}