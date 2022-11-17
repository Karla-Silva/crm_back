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
        console.log(err + "ESSE ERRO AQUI")
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
        console.log(searchUser.rows)
        if(searchUser && bcrypt.compareSync(user.password, searchUser.rows[0].password)){
            console.log('ETAPA 3')
            const token = uuidv4()
            const {id} = searchUser.rows[0]
            console.log(id + 'ID AQUI')
            await auth.InsertToken({id, token})
            res.send(token)
        }else{
            return res.status(401).send('Não encontrado. Usuário ou senha incorretos.')
        }
    }catch(error){
        console.error(error)
        return res.status(401)
    }
}

//---------------------------Detalhes dos usuários----------------------
exports.details = async (req, res) => {
    User.find({}).then(function(User){
        res.send(User);
    })
}

//-----------------------------Atualizar usuário-------------------------
exports.update = async (req, res, next) => {
    const authorization = req.headers['authorization']
    const token = authorization && authorization.split(' ')[1]
  
    if(!token) return res.sendStatus(401);

    try{
        jwt.verify(token, process.env.DATABASE_SECRET)
    } catch (error){
        return res.sendStatus(400)
    }

    User.findByIdAndUpdate({_id: req.params.id},
                       req.body).then(function(){
                        User.findOne({_id: req.params.id}).then(function(User){
          res.send(User);
        });
    }).catch(next);
}

//---------------------------Deletar usuário---------------------------
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

//------------------------------Rota Privada------------------------------
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