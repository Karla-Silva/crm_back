const User = require('../schema/schema.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../repositories/auth-repository.js')
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
        return res.sendStatus(201)
    } catch (err) {
        return res.sendStatus(500)
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
                    name: user.name,
                    email: user.email,
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
    
    //verificar se token pertence a este usuário
    const idInSession = await auth.FindToken(token)
    if (req.params.id != idInSession.rows[0].id){
        res.status(403).send("token is not valid")
    }
    const id = req.params.id;
    
    try{
        auth.LogOut(id);
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
    //verificar se token é válido
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]  //separar o "Bearer" do token
    
    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).send("token is not valid")
        }
    })
    
     try{
        const id = req.params.id;
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

    if(!token) return res.status(401).send('Não autorizado');

    try{
        jwt.verify(token, process.env.JWT_SECRET)
    } catch (error){
        return res.status(400).send('Não autorizado')
    }
    
    //verificar se token pertence a este usuário
    const idInSession = await auth.FindToken(token)
    if (req.params.id != idInSession.rows[0].id){
        res.status(403).send("token is not valid")
    }
    const id = req.params.id;
    
    try{
        auth.LogOut(id);
        auth.DeleteUser(id);
        res.status(200).send('Usuário deletado');
    }catch(err){
        console.log(err)
        res.status(500).send('Não deletado');
    }
}

//------------------------------Rota Privada (encontra usuário pelo id)------------------------------
exports.private = async (req, res) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
  
    if(!token) return res.sendStatus(401);

    try{
        jwt.verify(token, process.env.JWT_SECRET)
    } catch (error){
        return res.sendStatus(400)
    }

    const id = req.params.id
    const user = await auth.FindUserById(id)

    if(!user){
        return res.status(404).json({msg: "Usuário não encontrado"})
    }

    res.status(200).json({user})
}

//----------------------------Criar cliente----------------------
//Método POST
//verificar se crmuser está logado com token

//criar cliente crmuserid = req.params.id cliente = req.body

//-------------------------GET Clientes criados-----------------


//----------------------------Add necessidades------------------
//Método PUT

//--------------------------GET Clientes com necssidades---------


//----------------------------Add Proposta----------------------
//Método PUT

//--------------------------GET Clientes com proposta----------


//----------------------------Add Fim---------------------------
//Método PUT

//--------------------------GET Clientes encerrados------------


//----------------------------Deletar cliente-------------------