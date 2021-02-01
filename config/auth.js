const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//----------- Model de Usuários
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

//----------- Autenticação
module.exports = function(passport) {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'},(email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario){
                return done(null, false,{message: 'Esta conta não existe!'})
            }
            bcrypt.compare(senha, usuario.senha, (erro,batem) =>{
                if (batem){
                    return done(null,usuario)
                }else{
                    return done(null,false,{message:'Senha incorreta!'})
                }

            })
        })

    }))

// passa os dados do usuario para uma sessão (a confirmar)
//passport.serializeUser((usuario, done) =>{
//    done(null, usuario.email)
//})
//passport.deserializeUser((usuario, done) => {
//   Usuario.findOne({email: usuario.email}, (err, usuario) =>{
//        done(err, usuario)
//    })
//})
// o original estava assim:
                passport.serializeUser((usuario, done) =>{
                    done(null, usuario.id)
                })
                passport.deserializeUser((id, done) => {
                Usuario.findById(id, (err, usuario) =>{
                        done(err, usuario)
                    })
                })


}