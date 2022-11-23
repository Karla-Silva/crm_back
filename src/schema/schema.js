const Joi = require("joi");

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    plan: Joi.string().required()
})

const clientSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    necessities: Joi.string(),
    proposal: Joi.string(),
    result: Joi.boolean(),
    crmuserid: Joi.number().integer()
})

module.exports = {loginSchema, userSchema, clientSchema}