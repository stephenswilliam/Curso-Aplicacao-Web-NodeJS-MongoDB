//------------------ Definindo Módulos (bibliotecas)
    const express = require("express")
    // A constante app recebe a função que vem do express
    const app = express()
    const handlebars = require("express-handlebars")
    const bodyParser = require("body-parser")
    const mongoose = require("mongoose")
    // Importando as rotas do grupo admin e usuarios
    const admin = require('./routes/admin')
    const usuarios = require('./routes/usuarios')
    // o path é o módulo do node para manipular pastas
    const path = require('path')
    const session = require("express-session")
    const flash = require("connect-flash")
    const passport = require("passport")
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
    // passa o parametro passport para o auth.js
    require('./config/auth') (passport)
    
//------------------ Configurações

    // Configuração da Sessão, do passport e do flash (mesagens)
            //Secret é o nome para gerar a sessão. Pode ser qualquer nome. Deve ser um nome seguro.
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
            //A configuração do passport precisa ser depois da sesão e antes do flash
            app.use(passport.initialize())
            app.use(passport.session())
            //A configurando do Flash precisa ser abaixo da Sessão
        app.use(flash())

    // Configuração do Middleware, para trabalhar com sessões (ativado em toda conversação entre o cliente e o servidor)
        app.use((req,res,next) => {
            //locals serve para criar variáveis globais, para serem acessadas em qualquer lugar da app
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash('error')
            //cria variável que irá armazenar o usuario logado
            res.locals.user = req.user || null
            next()
        })

    // Configuração do Body Parser 
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    // Configuração do handlebars
            //Por existir várias templates engines no mercado, precisamos configurar o express para utilizar a handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main',}))
        app.set('view engine','handlebars')
            // Criar os diretórios: views/layouts e dentro de layouts criar o arquivo main.handlebars

    // Configuração do mongoose
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://localhost/blogapp",
        {useUnifiedTopology: true, useNewUrlParser: true}).then(()=>{
            console.log("MongoDB conectado com Sucesso!")
        }).catch((erro)=>{
            console.log("Erro de conexao ao MongoDB: " + erro)  
        })

    // Identificando a pasta de arquivos estáticos 'public'
        app.use(express.static(path.join(__dirname,'public')))

//------------------ Rotas

    app.get('/',(req,res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) => {
           res.render('index',{postagens})
        }).catch((erro) => {
            req.flash("error_msg","Houve um erro no Banco de Dados")
            res.redirect("/404")
        })
    })
    app.get('/404',(req,res) => {
        res.send("erro 404!")
    })
    app.get('/postagem/:slug',(req,res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if (postagem){
                res.render("postagem/index",{postagem: postagem})
            }else{
                req.flash("error_msg","Postagem não existe mais!")
                res.redirect("/")
            }
        }).catch((erro) => {
            req.flash("erros_msg","Erro ao acessar os dados da Postagem!")
            res.redirect("/")
        })
    })
    app.get('/categoria',(req,res) => {
        Categoria.find().lean().then((categorias) => {
            res.render('categoria/index',{categorias: categorias})
        }).catch((erro) => {
            req.flash('error_msg','Houve um erro ao acessar as Categorias!')
            res.redirect('/')
        })
    })
    app.get('/categoria/:slug',(req,res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            
            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
               res.render('postagem/postscateg',{postagens:postagens, categoria:categoria.nome})
            }).catch((erro) => {
                req.flash('error_msg','Erro ao acessar as Postagens!')
                res.redirect ('/categoria')
            })
        }).catch((erro) => {
            req.flash('error_msg','Erro ao acessar a categoria!')
            res.redirect('/categoria')
        })
    })


    // Define o prefixo /admin para as rotas do grupo de rotas admin (admin.js)
    app.use('/admin',admin)
    // Define o prefixo /usuarios para as rotas do grupo de rotas usuarios (usuarios.js)
    app.use('/usuarios',usuarios)

//------------------ Outros





//------------------ Servidor WEB 
// a última linha do código é onde se define o servidor, no caso na porta 8081
// a arrow function será executada quando terminar de instalar o servidor
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor rodando na URL http://localhost:" + PORT);
});