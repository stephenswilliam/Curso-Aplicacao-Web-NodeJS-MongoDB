module.exports = {
    eAdmin: function(req,res,next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next()
        }
        if(!req.isAuthenticated()){
            req.flash('error_msg','Faça o login para acessar esta função!')
        }else{
            req.flash('error_msg','Precisa ser Administrador para executar esta função!')
        }
        res.redirect('/')
    }
}