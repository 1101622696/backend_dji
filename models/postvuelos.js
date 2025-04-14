import mongoose from "mongoose";

const usuariosSchema=new mongoose.Schema({
    codigo:{type:String,required:true},
    consecutivoSolicitud:{type:String,unique:true},
    idUsuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    dronUsado:{type:Date,required:true},
    fechaInicio:{type:Date,required:true},
    horaInicio:{type:Date,required:true},
    horaFin:{type:Date,required:true},
    duracion:{type:Date,required:true},
    distanciaRecorrida:{type:Date,required:true},
    alturaMaxima:{type:Date,required:true},
    incidentes:{type:Date,required:true},
    propositoAlcanzado:{type:Date,required:true},
    observaciones:{type:Date,required:true},
    fechadeCreacion:{type:String,default: Date.now()},
    estado:{type:Date,required:true},
    proposito:{type:Date,required:true},
    empresa:{type:Date,required:true},

})

export default mongoose.model("Usuario",usuariosSchema)


