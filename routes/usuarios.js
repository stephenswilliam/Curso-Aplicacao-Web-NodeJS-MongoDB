const { resolveAny } = require('dns')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { setUncaughtExceptionCaptureCallback } = require('process')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/login',(req,res) => {
    res.render('usuarios/login')
})
router.post('/login',(req,res,next) => {
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req,res,next)
})
router.get('/logout', (req,res) => {
    req.logOut()
    req.flash('success_msg','Usuário desconectado!')
    res.redirect('/')
})

router.get('/registro', (req,res) => {
    res.render('usuarios/registro')
})

router.post('/registro',(req,res) => {

    var erros = []
    var nome = req.body.nome
    var email = req.body.email
    var senha = req.body.senha
    var senhaconf = req.body.senhaconf

    if (req.body.senha.length < 4){
        erros.push({texto: 'Senha muito pequena!'})
    }else{
        if (req.body.senha != req.body.senhaconf){
            erros.push({texto: 'Senhas não são iguais!'})
        }
    }
    if (erros.length > 0){
        res.render('usuarios/registro',{erros,nome,email,senha,senhaconf})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if (usuario) {
                erros.push({texto: 'O email já está cadastrado!'})
                res.render('usuarios/registro',{erros,nome,email,senha,senhaconf})
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                // Cria o hash da senha incluindo o salt, que são caracteres adicionais para dificultar ainda mais.
                bcrypt.genSalt(10, (erro,salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro,hash) => {
                        if (erro){
                            req.flash('error_msg','houve um erro ao salvar o Usuário!')
                            res.redirect('/')
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash('success_msg','Usuário cadastrado com sucesso!')
                            res.redirect('/')
                        }).catch((erro) =>{
                            req.flash('error_msg','Erro ao criar o usuário, tente novamente!')
                            res.redirect('/')
                        })
                    })
                })
            }
            }).catch((erro) => {
                req.flash('error_msg','Erro interno ao acessar o Arquivo de Usuários!')
                res.redirect('/')
            })
        }
})



module.exports = router