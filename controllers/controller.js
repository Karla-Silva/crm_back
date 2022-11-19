const User = require('../schema/schema.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../repositories/auth-repository.js')
const db = require('../database/db.js')
const { v4: uuidv4 } = require('uuid')
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
            res.send(token)
        }else{
            return res.status(401).send('Não encontrado. Usuário ou senha incorretos.')
        }
    }catch(error){
        return res.status(401).send('error')
    }
}

//---------------------------Detalhes dos usuários----------------------
exports.userslist = async (req, res) => {
    const usersList = await auth.UserList(); 
    return res.send(usersList).status(200);
}


//-----------------------------Atualizar nome-------------------------
exports.update = async (req, res, next) => {
    //verificar se token é válido
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]  //separar o "Bearer" do token
    
    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            res.status(403).json("token is not valid")
        }
    })

    //verificar se token pertence a este usuário
    const idInSession = await auth.FindToken(token)
    if (req.params.id != idInSession.rows[0].id){
        res.status(403).json("token is not valid")
    }
    
    //atualizar nome
    try{
        const id = req.params.id;
        const newName = req.body.name;
        await auth.UpdateName({id, newName});
        return res.status(200).send('Nome alterado');
    }catch{
        return res.status(500).send('error');
    }
}

//-----------------------------Atualizar email-------------------------

//-----------------------------Atualizar senha-------------------------

//-----------------------------Atualizar plano-------------------------


//---------------------------Deletar usuário REFAZER---------------------------
exports.delete = (req, res, next) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
  
    if(!token) return res.sendStatus(401);

    try{
        jwt.verify(token, process.env.DATABASE_SECRET)
    } catch (error){
        return res.sendStatus(400)
    }
    
    User.findByIdAndRemove({_id: req.params.id}).then(function(User){
        if(!User){
            return res.status(404).send('usuário não encontrado')
        }
      return res.send(200);
    }).catch(next);
}

//------------------------------Rota Privada REFAZER------------------------------
exports.private = async (req, res, next) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
  
    if(!token) return res.sendStatus(401);

    try{
        jwt.verify(token, process.env.DATABASE_SECRET)
    } catch (error){
        return res.sendStatus(400)
    }

    const id = req.params.id
    const user = await User.findById(id, '-password')

    if(!user){
        return res.status(404).json({msg: "Usuário não encontrado"})
    }

    res.status(200).json({user})
}