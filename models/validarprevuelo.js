import mongoose from "mongoose";

const validarprevueloSchema=new mongoose.Schema({
    codigo:{type:String,required:true},
    consecutivo:{type:String,unique:true},
    estado:{type:String,required:true},
    piloto:{type:String,required:true},
    permiso:{type:String,required:true},
    fecha:{type:String,required:true},
    notasprevuelo:{type:String,required:true},
})

export default mongoose.model("ValidarPrevuelo",validarprevueloSchema)


