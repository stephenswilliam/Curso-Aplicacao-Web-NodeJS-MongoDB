
//------------------ Grupo de rotas ADMIN

const { resolveAny } = require('dns')
const express =  require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
// cria a variável eAdmin e quando referenciada, executa só a função eAdmin dentro do arquivo eAdmin.js
const {eAdmin} = require('../helpers/eAdmin.js')

router.get('/', eAdmin, (req,res)=>{
    res.render('admin/index')
})

//----------------------------Rotas de Postagens

router.get('/postagens', eAdmin, (req,res) => {

    Postagem.find().populate("categoria").sort({data:'desc'}).lean().then((postagens) => {
        res.render('admin/postagens',{postagens: postagens})
    }).catch((erro) => {
        req.flash('error_msg','Erro ao acessar o Bando de Dados!')
        res.redirect('/admin')
    })
    
})

router.get('/postagens/edit/:id', eAdmin, (req,res) => {
    Postagem.findOne({_id: req.params.id}).populate("categoria").then((postagem) => {
       var id = postagem._id
       var titulo = postagem.titulo
       var slug = postagem.slug
       var descricao = postagem.descricao
       var conteudo = postagem.conteudo
       var categoria = postagem.categoria._id
       var nomecat = postagem.categoria.nome
       Categoria.find().lean().then((categorias) => {
           res.render('admin/editpostagens',{categorias,id,titulo,slug,descricao,conteudo,categoria,nomecat})
       }).catch((err) => {
           req.flash('error_msg','Erro ao acessar o Banco de Dados!')
           res.redirect('/admin')
       })
    }).catch((erro) => {
        req.flash('error_msg','Erro ao acessar a Postagem !')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/salvar/:id', eAdmin, (req,res) => {
                
    Postagem.findOne({_id: req.params.id}).then((postagem) => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        postagem.save().then(() =>{
            req.flash('success_msg','Postagem salva com sucesso!')
            res.redirect("/admin/postagens")
        }).catch((erro) => {
            req.flash('error_msg','Erro ao atualizar a Postagem!')
            res.redirect("/admin/postagens")
        })
    }).catch((erro) => {
        req.flash('error_msg','Erro ao salvar a Postagem !')
        res.redirect('/admin/postagens')
    })
    
})

router.get('/postagens/add', eAdmin, (req,res) => {

    Categoria.find().lean().then((categorias) => {
        var nomecat = 'Selecione uma categoria...'
        res.render('admin/addpostagens',{categorias,nomecat})
    }).catch((err) => {
        req.flash('error_msg','Erro ao acessar o Banco de Dados!')
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', eAdmin, (req,res) => {
    var titulo = req.body.titulo
    var slug = req.body.slug
    var descricao = req.body.descricao
    var conteudo = req.body.conteudo
    var categoria = req.body.categoria

    var erros = []

    if (!req.body.titulo) {
        erros.push({texto: 'Título invalido!'})
    }
    if (!req.body.slug) {
        erros.push({texto: 'Slug invalido!'})
    }
    if (!req.body.descricao) {
        erros.push({texto: 'Descrição invalida!'})
    }
    if (!req.body.conteudo) {
        erros.push({texto: 'Conteúdo invalido!'})
    }
    if (!req.body.categoria || req.body.categoria == "0") {
        erros.push({texto: 'Categoria invalida!'})
    }

    if (erros.length > 0) {
        Categoria.find().lean().then((categorias) => {
            Categoria.findOne({_id: req.body.categoria}).then((categoria) => {
                var nomecat = categoria.nome
                res.render('admin/addpostagens',{categorias,erros,titulo,slug,descricao,conteudo,categoria,nomecat})
            }).catch((err) => {
                var nomecat = 'Selecione uma Categoria...'
                res.render('admin/addpostagens',{categorias,erros,titulo,slug,descricao,conteudo,nomecat})
            })
        }).catch((err) => {
            req.flash('error_msg','Erro ao acessar o Banco de Dados')
            res.redirect('/admin')
        })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg','Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg',"Houve um erro no acesso ao Bando de Dados")
            res.redirect('/admin/postagens')
        })
    }
 })

 router.get('/postagens/delete/:id', eAdmin, (req,res) => {
    Postagem.deleteOne({_id: req.params.id}).then(() => {
        req.flash('success_msg','Postagem excluida com sucesso!')
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash('error_msg','Erro ao excluir a postagem')
        res.redirect("/admin/postagens")
    })
})

 

//----------------------------Rotas de Categorias
router.get('/categorias', eAdmin, (req,res) => {
    
    Categoria.find().lean().sort({data:'desc'}).then((categorias) => {
        res.render("admin/categorias",{categorias})
    }).catch((erro) => {
        req.flash("error_msg","Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
    
})
router.get('/categorias/add', eAdmin, (req,res) => {
    res.render('admin/addcategorias')
})
router.post('/categorias/nova', eAdmin, (req,res) => {
    const nome = req.body.nome
    const slug = req.body.slug
    var erros = []

    if ( !req.body.nome ) {
        erros.push({texto: "Nome inválido"})
    } else {
        if (req.body.nome.length < 2) {
            erros.push({texto: "Nome da categoria muito pequeno !"})
        }
    }
    if ( !req.body.slug ){
        erros.push({texto: "Slug inválido"})
    }

    if (erros.length > 0){
        res.render("admin/addcategorias",{erros,nome,slug})
    }else{
    
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() =>{
            req.flash("success_msg","Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((erro) => {
            req.flash("error_msg","Houve um erro ao salvar a categoria. Tente novamente.")
            res.redirect("/admin/categorias")
        })
    }
    
})
router.get('/categorias/edit/:id', eAdmin, (req,res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        var id = categoria._id
        var nome = categoria.nome
        var slug = categoria.slug
        res.render("admin/editcategorias",{id, nome, slug})
    }).catch((err) => {
        req.flash('error_msg','Erro ao acessar a categoria')
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/salvar/:id', eAdmin, (req,res) => {
    var id = req.params.id
    var nome = req.body.nome
    var slug = req.body.slug
    var erros = []

    if ( !req.body.nome ) {
        erros.push({texto: "Nome inválido"})
    } else {
        if (req.body.nome.length < 2) {
            erros.push({texto: "Nome da categoria muito pequeno !"})
        }
    }
    if ( !req.body.slug ){
        erros.push({texto: "Slug inválido"})
    }

    if (erros.length > 0){
        res.render("admin/editcategorias",{erros, id, nome, slug})
    }else{
        Categoria.findOne({_id: req.params.id}).then((categoria) => {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug
            categoria.save().then(() =>{
                req.flash('success_msg','Categoria atualizada com sucesso!')
                res.redirect("/admin/categorias")
            }).catch(() => {
                req.flash('error_msg','Erro ao atualizar a categoria')
                res.redirect("/admin/categorias")
            })
        })
    }
})

router.get('/categorias/delete/:id', eAdmin, (req,res) => {
    Categoria.deleteOne({_id: req.params.id}).then(() => {
        req.flash('success_msg','Categoria excluida com sucesso!')
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash('error_msg','Erro ao excluir a categoria')
        res.redirect("/admin/categorias")
    })
})

module.exports = router