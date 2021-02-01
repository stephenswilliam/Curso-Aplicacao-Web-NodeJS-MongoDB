const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Categoria = new Schema({
    nome:{type: String, required: true},
    slug:{type: String, required: true},
    data:{type: Date, default: Date.now()}
})
// cria a collection categorias (conjunto de Categoria)
mongoose.model("categorias",Categoria)