const User = require('../models/User')
const { compare } = require('bcryptjs')

function checkAllFields(body) {
    const keys = Object.keys(body)
    
        for(key of keys) {
            if (body[key] == '') {
                return {
                    user: body,
                    error: 'Por favor preencha todos os campos!'
                }
            }
        }
}

module.exports = {
    async post(req, res, next) {
        const fillAllFields = checkAllfields(req.body)
        if (fillAllFields) {
            return res.render('user/register', fillAllFields)
        }
    
        let { email, cpf_cnpj, password, passwordRepeat } = req.body

        cpf_cnpj = cpf_cnpj.replace(/\D/g, '')

        const user = await User.findOne({
            where: {email},
            or: {cpf_cnpj}
        })

        if(user) return res.render('user/register', {
            user: req.body,
            error: 'Usuário já cadastrado.'
        })

        if(password != passwordRepeat) return res.render('user/register', {
            user: req.body,
            error: 'Senha diferente.'
        })

        next()
    },
    async show(req, res, next) {
     const { userId: id } = req.session
    
        const user = await User.findOne({ where: { id } })
    
        if (!user) return res.render('user/register', {
            error: 'Usuário não encontrado'
        })

        req.user = user
        
        next()
    },
    async update(req, res, next) {
        //check if has all fields
        const fillAllFields = checkAllFields(req.body)
        if(fillAllFields){
            return res.render("user/index", fillAllFields)
        }

        const { id, password } = req.body

        if (!password) return res.render("user/index", {
            user: req.body,
            error: "Coloque sua senha para atualizar seu cadastro."
        })

        const user = await User.findOne({ where: {id} })

        const passed = await compare(password, user.password)

        if(!passed) return res.render("user/index", {
            user: req.body,
            error: "Senha incorreta."
        })

        req.user = user

        next()
    }
}