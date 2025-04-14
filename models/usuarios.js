import mongoose from "mongoose";

const usuariosSchema=new mongoose.Schema({
    nombre:{type:String,required:true},
    email:{type:String,unique:true},
    password:{type:String,required:true},
    perfil:{type:String,required:true},
})

export default mongoose.model("Usuario",usuariosSchema)


